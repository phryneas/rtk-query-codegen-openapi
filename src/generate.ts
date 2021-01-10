import chalk from 'chalk';
import * as fs from 'fs';
import { camelCase } from 'lodash';
import ApiGenerator, {
  getOperationName,
  getReferenceName,
  isReference,
  supportDeepObjects,
} from 'oazapfts/lib/codegen/generate';
import { createQuestionToken, keywordType } from 'oazapfts/lib/codegen/tscodegen';
import { OpenAPIV3 } from 'openapi-types';
import * as ts from 'typescript';
import { generateReactHooks } from './generators/react-hooks';
import { GenerationOptions, OperationDefinition } from './types';
import { capitalize, getOperationDefinitions, getV3Doc, isQuery } from './utils';

const { factory } = ts;

function defaultIsDataResponse(code: string) {
  const parsedCode = Number(code);
  return !Number.isNaN(parsedCode) && parsedCode >= 200 && parsedCode < 300;
}

let customBaseQueryNode: ts.ImportDeclaration | undefined;
let functionName: string, filePath: string;
let hadErrorsDuringGeneration = false;

export async function generateApi(
  spec: string,
  {
    exportName = 'api',
    reducerPath,
    baseQuery = 'fetchBaseQuery',
    argSuffix = 'ApiArg',
    responseSuffix = 'ApiResponse',
    baseUrl,
    hooks,
    isDataResponse = defaultIsDataResponse,
  }: GenerationOptions
) {
  const v3Doc = await getV3Doc(spec);
  if (typeof baseUrl !== 'string') {
    baseUrl = v3Doc.servers?.[0].url ?? 'https://example.com';
  }

  const apiGen = new ApiGenerator(v3Doc, {});

  const operationDefinitions = getOperationDefinitions(v3Doc);

  const resultFile = ts.createSourceFile(
    'someFileName.ts',
    '',
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const interfaces: Record<string, ts.InterfaceDeclaration | ts.TypeAliasDeclaration> = {};
  function registerInterface(declaration: ts.InterfaceDeclaration | ts.TypeAliasDeclaration) {
    const name = declaration.name.escapedText.toString();
    if (name in interfaces) {
      throw new Error('interface/type alias already registered');
    }
    interfaces[name] = declaration;
    return declaration;
  }

  /**
   * baseQuery handling
   * 1. if baseQuery is specified, we should confirm the path/file location
   * 2. if there is a seperator in the path like :, we assume they're targeting a named function
   *    --- If it's TS, we could confirm the BaseQuery signature?
   * 3. if there is a not a seperator, we should use the default export
   */

  function fileExists(path: string) {
    let content;
    try {
      content = fs.readFileSync(`${process.cwd()}/${filePath}`, { encoding: 'utf-8' });
    } catch (err) {
      console.warn(chalk`
{red Unable to locate the specified baseQuery file at: ${filePath}}

{green Defaulting to use {underline.bold fetchBaseQuery} as the {bold baseQuery}}
      `);

      // Set a flag to echo further output at the end of the CLI
      hadErrorsDuringGeneration = true;

      return false;
    }

    return true;
  }

  if (baseQuery !== 'fetchBaseQuery') {
    if (baseQuery.includes(':')) {
      // User specified a named function
      [filePath, functionName] = baseQuery.split(':');
      if (fileExists(`${process.cwd()}/${filePath}`)) {
        // We could validate the presence of the named function as well as the file?

        customBaseQueryNode = generateImportNode(
          filePath,
          {
            ...(functionName
              ? {
                  [functionName]: functionName,
                }
              : {}),
          },
          !functionName ? 'customBaseQuery' : undefined
        );
      }
    } else {
      filePath = baseQuery;

      if (fileExists(`${process.cwd()}/${baseQuery}`)) {
        // import { default as functionName } from filePath
        functionName = 'customBaseQuery';

        customBaseQueryNode = generateImportNode(
          filePath,
          {
            ...(functionName
              ? {
                  default: functionName,
                }
              : {}),
          },
          !functionName ? 'customBaseQuery' : undefined
        );
      } else {
        functionName = 'fetchBaseQuery';
      }
    }
  }

  const sourceCode = printer.printNode(
    ts.EmitHint.Unspecified,
    factory.createSourceFile(
      [
        generateImportNode('@rtk-incubator/rtk-query', {
          createApi: 'createApi',
          ...(baseQuery === 'fetchBaseQuery' || !customBaseQueryNode ? { fetchBaseQuery: 'fetchBaseQuery' } : {}),
        }),
        ...(customBaseQueryNode ? [customBaseQueryNode] : []),
        generateCreateApiCall(),
        ...Object.values(interfaces),
        ...apiGen['aliases'],
        ...(hooks ? [generateReactHooks({ exportName, operationDefinitions })] : []),
      ],
      factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None
    ),
    resultFile
  );

  return { sourceCode, hadErrorsDuringGeneration };

  function generateImportNode(pkg: string, namedImports: Record<string, string>, defaultImportName?: string) {
    return factory.createImportDeclaration(
      undefined,
      undefined,
      factory.createImportClause(
        false,
        defaultImportName !== undefined ? factory.createIdentifier(defaultImportName) : undefined,
        factory.createNamedImports(
          Object.entries(namedImports)
            .filter((args) => args[1])
            .map(([propertyName, name]) =>
              factory.createImportSpecifier(
                name === propertyName ? undefined : factory.createIdentifier(propertyName),
                factory.createIdentifier(name as string)
              )
            )
        )
      ),
      factory.createStringLiteral(pkg)
    );
  }

  function generateCreateApiCall() {
    return factory.createVariableStatement(
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier(exportName),
            undefined,
            undefined,
            factory.createCallExpression(factory.createIdentifier('createApi'), undefined, [
              factory.createObjectLiteralExpression(
                [
                  !reducerPath
                    ? undefined
                    : factory.createPropertyAssignment(
                        factory.createIdentifier('reducerPath'),
                        factory.createStringLiteral(reducerPath)
                      ),
                  factory.createPropertyAssignment(
                    factory.createIdentifier('baseQuery'),
                    factory.createCallExpression(
                      factory.createIdentifier(functionName ? functionName : baseQuery),
                      undefined,
                      [
                        factory.createObjectLiteralExpression(
                          [
                            factory.createPropertyAssignment(
                              factory.createIdentifier('baseUrl'),
                              factory.createStringLiteral(baseUrl as string)
                            ),
                          ],
                          false
                        ),
                      ]
                    )
                  ),
                  factory.createPropertyAssignment(
                    factory.createIdentifier('entityTypes'),
                    generateEntityTypes({ v3Doc, operationDefinitions })
                  ),
                  factory.createPropertyAssignment(
                    factory.createIdentifier('endpoints'),
                    factory.createArrowFunction(
                      undefined,
                      undefined,
                      [
                        factory.createParameterDeclaration(
                          undefined,
                          undefined,
                          undefined,
                          factory.createIdentifier('build'),
                          undefined,
                          undefined,
                          undefined
                        ),
                      ],
                      undefined,
                      factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                      factory.createParenthesizedExpression(
                        factory.createObjectLiteralExpression(
                          operationDefinitions.map((operationDefinition) =>
                            generateEndpoint({
                              operationDefinition,
                            })
                          ),
                          true
                        )
                      )
                    )
                  ),
                ].filter(removeUndefined),
                true
              ),
            ])
          ),
        ],
        ts.NodeFlags.Const
      )
    );
  }

  function generateEntityTypes(_: { operationDefinitions: OperationDefinition[]; v3Doc: OpenAPIV3.Document }) {
    return factory.createArrayLiteralExpression(
      [
        /*factory.createStringLiteral("Posts")*/
      ],
      false
    );
  }

  function generateEndpoint({ operationDefinition }: { operationDefinition: OperationDefinition }) {
    const {
      verb,
      path,
      pathItem,
      operation,
      operation: { responses, requestBody },
    } = operationDefinition;

    const _isQuery = isQuery(verb);

    const returnsJson = apiGen.hasJsonContent(responses);
    let ResponseType: ts.TypeNode = factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
    if (returnsJson) {
      const returnTypes = Object.entries(responses || {})
        .map(
          ([code, response]) =>
            [
              code,
              apiGen.resolve(response),
              apiGen.getTypeFromResponse(response) || factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
            ] as const
        )
        .filter(([status, response]) => isDataResponse(status, apiGen.resolve(response), responses || {}))
        .map(([code, response, type]) =>
          ts.addSyntheticLeadingComment(
            { ...type },
            ts.SyntaxKind.MultiLineCommentTrivia,
            `* status ${code} ${response.description} `,
            false
          )
        )
        .filter((type) => type !== keywordType.void);
      if (returnTypes.length > 0) {
        ResponseType = factory.createUnionTypeNode(returnTypes);
      }
    }

    const ResponseTypeName = factory.createTypeReferenceNode(
      registerInterface(
        factory.createTypeAliasDeclaration(
          undefined,
          [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          capitalize(getOperationName(verb, path, operation.operationId) + responseSuffix),
          undefined,
          ResponseType
        )
      ).name
    );

    const parameters = supportDeepObjects([
      ...apiGen.resolveArray(pathItem.parameters),
      ...apiGen.resolveArray(operation.parameters),
    ]);

    const queryArg: QueryArgDefinitions = {};
    for (const param of parameters) {
      let name = camelCase(param.name);
      queryArg[name] = {
        origin: 'param',
        name,
        originalName: param.name,
        type: apiGen.getTypeFromSchema(isReference(param) ? param : param.schema),
        required: param.required,
        param,
      };
    }

    if (requestBody) {
      const body = apiGen.resolve(requestBody);
      const schema = apiGen.getSchemaFromContent(body.content);
      const type = apiGen.getTypeFromSchema(schema);
      const schemaName = camelCase((type as any).name || getReferenceName(schema) || 'body');
      let name = schemaName in queryArg ? 'body' : schemaName;

      while (name in queryArg) {
        name = '_' + name;
      }

      queryArg[schemaName] = {
        origin: 'body',
        name,
        originalName: schemaName,
        type: apiGen.getTypeFromSchema(schema),
        required: true,
        body,
      };
    }

    // TODO strip param names where applicable
    //const stripped = camelCase(param.name.replace(/.+\./, ""));

    const QueryArg = factory.createTypeReferenceNode(
      registerInterface(
        factory.createTypeAliasDeclaration(
          undefined,
          [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          capitalize(getOperationName(verb, path, operation.operationId) + argSuffix),
          undefined,
          factory.createTypeLiteralNode(
            Object.entries(queryArg).map(([name, def]) => {
              const comment = def.origin === 'param' ? def.param.description : def.body.description;
              const node = factory.createPropertySignature(
                undefined,
                name,
                createQuestionToken(!def.required),
                def.type
              );

              if (comment) {
                return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, `* ${comment} `, true);
              }
              return node;
            })
          )
        )
      ).name
    );

    return factory.createPropertyAssignment(
      factory.createIdentifier(getOperationName(verb, path, operation.operationId)),

      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier('build'),
          factory.createIdentifier(_isQuery ? 'query' : 'mutation')
        ),
        [ResponseTypeName, QueryArg],
        [
          factory.createObjectLiteralExpression(
            [
              factory.createPropertyAssignment(
                factory.createIdentifier('query'),
                generateQueryFn({ operationDefinition, queryArg })
              ),
              ...(_isQuery
                ? generateQueryEndpointProps({ operationDefinition })
                : generateMutationEndpointProps({ operationDefinition })),
            ],
            true
          ),
        ]
      )
    );
  }

  function generateQueryFn({
    operationDefinition,
    queryArg,
  }: {
    operationDefinition: OperationDefinition;
    queryArg: QueryArgDefinitions;
  }) {
    const { path, verb } = operationDefinition;

    const pathParameters = Object.values(queryArg).filter((def) => def.origin === 'param' && def.param.in === 'path');
    const queryParameters = Object.values(queryArg).filter((def) => def.origin === 'param' && def.param.in === 'query');
    const headerParameters = Object.values(queryArg).filter(
      (def) => def.origin === 'param' && def.param.in === 'header'
    );
    const cookieParameters = Object.values(queryArg).filter(
      (def) => def.origin === 'param' && def.param.in === 'cookie'
    );
    const bodyParameter = Object.values(queryArg).find((def) => def.origin === 'body');

    const rootObject = factory.createIdentifier('queryArg');

    return factory.createArrowFunction(
      undefined,
      undefined,
      Object.keys(queryArg).length
        ? [
            factory.createParameterDeclaration(
              undefined,
              undefined,
              undefined,
              rootObject,
              undefined,
              undefined,
              undefined
            ),
          ]
        : [],
      undefined,
      factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      factory.createParenthesizedExpression(
        factory.createObjectLiteralExpression(
          [
            factory.createPropertyAssignment(
              factory.createIdentifier('url'),
              generatePathExpression(path, pathParameters, rootObject)
            ),
            isQuery(verb)
              ? undefined
              : factory.createPropertyAssignment(
                  factory.createIdentifier('method'),
                  factory.createStringLiteral(verb.toUpperCase())
                ),
            bodyParameter == undefined
              ? undefined
              : factory.createPropertyAssignment(
                  factory.createIdentifier('body'),
                  factory.createPropertyAccessExpression(rootObject, factory.createIdentifier(bodyParameter.name))
                ),
            cookieParameters.length == 0
              ? undefined
              : factory.createPropertyAssignment(
                  factory.createIdentifier('cookies'),
                  generateQuerArgObjectLiteralExpression(cookieParameters, rootObject)
                ),
            headerParameters.length == 0
              ? undefined
              : factory.createPropertyAssignment(
                  factory.createIdentifier('headers'),
                  generateQuerArgObjectLiteralExpression(headerParameters, rootObject)
                ),
            queryParameters.length == 0
              ? undefined
              : factory.createPropertyAssignment(
                  factory.createIdentifier('params'),
                  generateQuerArgObjectLiteralExpression(queryParameters, rootObject)
                ),
          ].filter(removeUndefined),
          false
        )
      )
    );
  }

  function generateQueryEndpointProps({ operationDefinition }: { operationDefinition: OperationDefinition }) {
    return (
      [] || /* TODO needs implementation - skip for now */ [
        factory.createPropertyAssignment(
          factory.createIdentifier('provides'),
          factory.createArrowFunction(
            undefined,
            undefined,
            [
              factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                factory.createIdentifier('_'),
                undefined,
                undefined,
                undefined
              ),
              factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                factory.createIdentifier('id'),
                undefined,
                undefined,
                undefined
              ),
            ],
            undefined,
            factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            factory.createArrayLiteralExpression(
              [
                factory.createObjectLiteralExpression(
                  [
                    factory.createPropertyAssignment(
                      factory.createIdentifier('type'),
                      factory.createStringLiteral('Posts')
                    ),
                    factory.createShorthandPropertyAssignment(factory.createIdentifier('id'), undefined),
                  ],
                  false
                ),
              ],
              false
            )
          )
        ),
      ]
    );
  }

  function generateMutationEndpointProps(_: { operationDefinition: OperationDefinition }) {
    return (
      [] || /* TODO needs implementation - skip for now */ [
        factory.createPropertyAssignment(
          factory.createIdentifier('invalidates'),
          factory.createArrayLiteralExpression(
            [
              factory.createObjectLiteralExpression(
                [
                  factory.createPropertyAssignment(
                    factory.createIdentifier('type'),
                    factory.createStringLiteral('Posts')
                  ),
                  factory.createPropertyAssignment(factory.createIdentifier('id'), factory.createStringLiteral('LIST')),
                ],
                false
              ),
            ],
            false
          )
        ),
      ]
    );
  }

  function removeUndefined<T>(t: T | undefined): t is T {
    return typeof t !== 'undefined';
  }
}

function generatePathExpression(path: string, pathParameters: QueryArgDefinition[], rootObject: ts.Identifier) {
  const expressions: Array<[string, string]> = [];

  const head = path.replace(/\{(.*?)\}(.*?)(?=\{|$)/g, (_, expression, literal) => {
    const param = pathParameters.find((p) => p.originalName === expression);
    if (!param) {
      throw new Error(`path parameter ${expression} does not seem to be defined?`);
    }
    expressions.push([param.name, literal]);
    return '';
  });

  return expressions.length
    ? factory.createTemplateExpression(
        factory.createTemplateHead(head),
        expressions.map(([prop, literal], index) =>
          factory.createTemplateSpan(
            factory.createPropertyAccessExpression(rootObject, factory.createIdentifier(prop)),
            index === expressions.length - 1
              ? factory.createTemplateTail(literal)
              : factory.createTemplateMiddle(literal)
          )
        )
      )
    : factory.createNoSubstitutionTemplateLiteral(head);
}

function generateQuerArgObjectLiteralExpression(queryArgs: QueryArgDefinition[], rootObject: ts.Identifier) {
  return factory.createObjectLiteralExpression(
    queryArgs.map(
      (param) =>
        factory.createPropertyAssignment(
          factory.createIdentifier(param.originalName),
          factory.createPropertyAccessExpression(rootObject, factory.createIdentifier(param.name))
        ),
      true
    )
  );
}

type QueryArgDefinition = {
  name: string;
  originalName: string;
  type: ts.TypeNode;
  required?: boolean;
} & (
  | {
      origin: 'param';
      param: OpenAPIV3.ParameterObject;
    }
  | {
      origin: 'body';
      body: OpenAPIV3.RequestBodyObject;
    }
);
type QueryArgDefinitions = Record<string, QueryArgDefinition>;
