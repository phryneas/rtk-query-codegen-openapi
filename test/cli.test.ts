import { exec, ExecException } from 'child_process';
import path from 'path';

// cases to test

// Error due to file not existing, defaults to fetchBaseQuery:

// node ../lib/bin/cli.js -h --baseQuery ./customBaseQuery23.ts  petstore.json
// Named import/export from a file:

// node ../lib/bin/cli.js -h --baseQuery ./customBaseQuery.ts:namedBaseQuery  petstore.json
// Default export from a file:

// node ../lib/bin/cli.js -h --baseQuery ./customBaseQuery.ts petstore.json

function cli(
  args: string[],
  cwd: string
): Promise<{ code: number; error: ExecException | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    exec(`ts-node ${path.resolve('./src/bin/cli.ts')} ${args.join(' ')}`, { cwd }, (error, stdout, stderr) => {
      resolve({
        code: error && error.code ? error.code : 0,
        error,
        stdout,
        stderr,
      });
    });
  });
}

describe('CLI options testing', () => {
  it('should log output to the console when a filename is not specified', async () => {
    const result = await cli([`./test/fixtures/petstore.json`], '.');
    expect(result.stdout).toMatchInlineSnapshot(`
      "import { createApi, fetchBaseQuery } from \\"@rtk-incubator/rtk-query\\";
      export const api = createApi({
        baseQuery: fetchBaseQuery({ baseUrl: \\"/api/v3\\" }),
        entityTypes: [],
        endpoints: (build) => ({
          getHealthcheck: build.query<
            GetHealthcheckApiResponse,
            GetHealthcheckApiArg
          >({
            query: () => ({ url: \`/healthcheck\` }),
          }),
          updatePet: build.mutation<UpdatePetApiResponse, UpdatePetApiArg>({
            query: (queryArg) => ({ url: \`/pet\`, method: \\"PUT\\", body: queryArg.pet }),
          }),
          addPet: build.mutation<AddPetApiResponse, AddPetApiArg>({
            query: (queryArg) => ({
              url: \`/pet\`,
              method: \\"POST\\",
              body: queryArg.pet,
            }),
          }),
          findPetsByStatus: build.query<
            FindPetsByStatusApiResponse,
            FindPetsByStatusApiArg
          >({
            query: (queryArg) => ({
              url: \`/pet/findByStatus\`,
              params: { status: queryArg.status },
            }),
          }),
          findPetsByTags: build.query<
            FindPetsByTagsApiResponse,
            FindPetsByTagsApiArg
          >({
            query: (queryArg) => ({
              url: \`/pet/findByTags\`,
              params: { tags: queryArg.tags },
            }),
          }),
          getPetById: build.query<GetPetByIdApiResponse, GetPetByIdApiArg>({
            query: (queryArg) => ({ url: \`/pet/\${queryArg.petId}\` }),
          }),
          updatePetWithForm: build.mutation<
            UpdatePetWithFormApiResponse,
            UpdatePetWithFormApiArg
          >({
            query: (queryArg) => ({
              url: \`/pet/\${queryArg.petId}\`,
              method: \\"POST\\",
              params: { name: queryArg.name, status: queryArg.status },
            }),
          }),
          deletePet: build.mutation<DeletePetApiResponse, DeletePetApiArg>({
            query: (queryArg) => ({
              url: \`/pet/\${queryArg.petId}\`,
              method: \\"DELETE\\",
              headers: { api_key: queryArg.apiKey },
            }),
          }),
          uploadFile: build.mutation<UploadFileApiResponse, UploadFileApiArg>({
            query: (queryArg) => ({
              url: \`/pet/\${queryArg.petId}/uploadImage\`,
              method: \\"POST\\",
              body: queryArg.body,
              params: { additionalMetadata: queryArg.additionalMetadata },
            }),
          }),
          getInventory: build.query<GetInventoryApiResponse, GetInventoryApiArg>({
            query: () => ({ url: \`/store/inventory\` }),
          }),
          placeOrder: build.mutation<PlaceOrderApiResponse, PlaceOrderApiArg>({
            query: (queryArg) => ({
              url: \`/store/order\`,
              method: \\"POST\\",
              body: queryArg.order,
            }),
          }),
          getOrderById: build.query<GetOrderByIdApiResponse, GetOrderByIdApiArg>({
            query: (queryArg) => ({ url: \`/store/order/\${queryArg.orderId}\` }),
          }),
          deleteOrder: build.mutation<DeleteOrderApiResponse, DeleteOrderApiArg>({
            query: (queryArg) => ({
              url: \`/store/order/\${queryArg.orderId}\`,
              method: \\"DELETE\\",
            }),
          }),
          createUser: build.mutation<CreateUserApiResponse, CreateUserApiArg>({
            query: (queryArg) => ({
              url: \`/user\`,
              method: \\"POST\\",
              body: queryArg.user,
            }),
          }),
          createUsersWithListInput: build.mutation<
            CreateUsersWithListInputApiResponse,
            CreateUsersWithListInputApiArg
          >({
            query: (queryArg) => ({
              url: \`/user/createWithList\`,
              method: \\"POST\\",
              body: queryArg.body,
            }),
          }),
          loginUser: build.query<LoginUserApiResponse, LoginUserApiArg>({
            query: (queryArg) => ({
              url: \`/user/login\`,
              params: { username: queryArg.username, password: queryArg.password },
            }),
          }),
          logoutUser: build.query<LogoutUserApiResponse, LogoutUserApiArg>({
            query: () => ({ url: \`/user/logout\` }),
          }),
          getUserByName: build.query<GetUserByNameApiResponse, GetUserByNameApiArg>({
            query: (queryArg) => ({ url: \`/user/\${queryArg.username}\` }),
          }),
          updateUser: build.mutation<UpdateUserApiResponse, UpdateUserApiArg>({
            query: (queryArg) => ({
              url: \`/user/\${queryArg.username}\`,
              method: \\"PUT\\",
              body: queryArg.user,
            }),
          }),
          deleteUser: build.mutation<DeleteUserApiResponse, DeleteUserApiArg>({
            query: (queryArg) => ({
              url: \`/user/\${queryArg.username}\`,
              method: \\"DELETE\\",
            }),
          }),
        }),
      });
      export type GetHealthcheckApiResponse = /** status 200 OK */ {
        message: string;
      };
      export type GetHealthcheckApiArg = {};
      export type UpdatePetApiResponse = /** status 200 Successful operation */ Pet;
      export type UpdatePetApiArg = {
        /** Update an existent pet in the store */
        pet: Pet;
      };
      export type AddPetApiResponse = /** status 200 Successful operation */ Pet;
      export type AddPetApiArg = {
        /** Create a new pet in the store */
        pet: Pet;
      };
      export type FindPetsByStatusApiResponse = /** status 200 successful operation */ Pet[];
      export type FindPetsByStatusApiArg = {
        /** Status values that need to be considered for filter */
        status?: \\"available\\" | \\"pending\\" | \\"sold\\";
      };
      export type FindPetsByTagsApiResponse = /** status 200 successful operation */ Pet[];
      export type FindPetsByTagsApiArg = {
        /** Tags to filter by */
        tags?: string[];
      };
      export type GetPetByIdApiResponse = /** status 200 successful operation */ Pet;
      export type GetPetByIdApiArg = {
        /** ID of pet to return */
        petId: number;
      };
      export type UpdatePetWithFormApiResponse = unknown;
      export type UpdatePetWithFormApiArg = {
        /** ID of pet that needs to be updated */
        petId: number;
        /** Name of pet that needs to be updated */
        name?: string;
        /** Status of pet that needs to be updated */
        status?: string;
      };
      export type DeletePetApiResponse = unknown;
      export type DeletePetApiArg = {
        apiKey?: string;
        /** Pet id to delete */
        petId: number;
      };
      export type UploadFileApiResponse = /** status 200 successful operation */ ApiResponse;
      export type UploadFileApiArg = {
        /** ID of pet to update */
        petId: number;
        /** Additional Metadata */
        additionalMetadata?: string;
        body: string;
      };
      export type GetInventoryApiResponse = /** status 200 successful operation */ {
        [key: string]: number;
      };
      export type GetInventoryApiArg = {};
      export type PlaceOrderApiResponse = /** status 200 successful operation */ Order;
      export type PlaceOrderApiArg = {
        order: Order;
      };
      export type GetOrderByIdApiResponse = /** status 200 successful operation */ Order;
      export type GetOrderByIdApiArg = {
        /** ID of order that needs to be fetched */
        orderId: number;
      };
      export type DeleteOrderApiResponse = unknown;
      export type DeleteOrderApiArg = {
        /** ID of the order that needs to be deleted */
        orderId: number;
      };
      export type CreateUserApiResponse = unknown;
      export type CreateUserApiArg = {
        /** Created user object */
        user: User;
      };
      export type CreateUsersWithListInputApiResponse = /** status 200 Successful operation */ User;
      export type CreateUsersWithListInputApiArg = {
        body: User[];
      };
      export type LoginUserApiResponse = /** status 200 successful operation */ string;
      export type LoginUserApiArg = {
        /** The user name for login */
        username?: string;
        /** The password for login in clear text */
        password?: string;
      };
      export type LogoutUserApiResponse = unknown;
      export type LogoutUserApiArg = {};
      export type GetUserByNameApiResponse = /** status 200 successful operation */ User;
      export type GetUserByNameApiArg = {
        /** The name that needs to be fetched. Use user1 for testing.  */
        username: string;
      };
      export type UpdateUserApiResponse = unknown;
      export type UpdateUserApiArg = {
        /** name that need to be deleted */
        username: string;
        /** Update an existent user in the store */
        user: User;
      };
      export type DeleteUserApiResponse = unknown;
      export type DeleteUserApiArg = {
        /** The name that needs to be deleted */
        username: string;
      };
      export type Category = {
        id?: number;
        name?: string;
      };
      export type Tag = {
        id?: number;
        name?: string;
      };
      export type Pet = {
        id?: number;
        name: string;
        category?: Category;
        photoUrls: string[];
        tags?: Tag[];
        status?: \\"available\\" | \\"pending\\" | \\"sold\\";
      };
      export type ApiResponse = {
        code?: number;
        type?: string;
        message?: string;
      };
      export type Order = {
        id?: number;
        petId?: number;
        quantity?: number;
        shipDate?: string;
        status?: \\"placed\\" | \\"approved\\" | \\"delivered\\";
        complete?: boolean;
      };
      export type User = {
        id?: number;
        username?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
        phone?: string;
        userStatus?: number;
      };

      "
    `);
  });

  it('should generate react hooks as a part of the output', async () => {
    const result = await cli(['-h', `./test/fixtures/petstore.json`], '.');
    expect(result.stdout).toMatchInlineSnapshot(`
      "import { createApi, fetchBaseQuery } from \\"@rtk-incubator/rtk-query\\";
      export const api = createApi({
        baseQuery: fetchBaseQuery({ baseUrl: \\"/api/v3\\" }),
        entityTypes: [],
        endpoints: (build) => ({
          getHealthcheck: build.query<
            GetHealthcheckApiResponse,
            GetHealthcheckApiArg
          >({
            query: () => ({ url: \`/healthcheck\` }),
          }),
          updatePet: build.mutation<UpdatePetApiResponse, UpdatePetApiArg>({
            query: (queryArg) => ({ url: \`/pet\`, method: \\"PUT\\", body: queryArg.pet }),
          }),
          addPet: build.mutation<AddPetApiResponse, AddPetApiArg>({
            query: (queryArg) => ({
              url: \`/pet\`,
              method: \\"POST\\",
              body: queryArg.pet,
            }),
          }),
          findPetsByStatus: build.query<
            FindPetsByStatusApiResponse,
            FindPetsByStatusApiArg
          >({
            query: (queryArg) => ({
              url: \`/pet/findByStatus\`,
              params: { status: queryArg.status },
            }),
          }),
          findPetsByTags: build.query<
            FindPetsByTagsApiResponse,
            FindPetsByTagsApiArg
          >({
            query: (queryArg) => ({
              url: \`/pet/findByTags\`,
              params: { tags: queryArg.tags },
            }),
          }),
          getPetById: build.query<GetPetByIdApiResponse, GetPetByIdApiArg>({
            query: (queryArg) => ({ url: \`/pet/\${queryArg.petId}\` }),
          }),
          updatePetWithForm: build.mutation<
            UpdatePetWithFormApiResponse,
            UpdatePetWithFormApiArg
          >({
            query: (queryArg) => ({
              url: \`/pet/\${queryArg.petId}\`,
              method: \\"POST\\",
              params: { name: queryArg.name, status: queryArg.status },
            }),
          }),
          deletePet: build.mutation<DeletePetApiResponse, DeletePetApiArg>({
            query: (queryArg) => ({
              url: \`/pet/\${queryArg.petId}\`,
              method: \\"DELETE\\",
              headers: { api_key: queryArg.apiKey },
            }),
          }),
          uploadFile: build.mutation<UploadFileApiResponse, UploadFileApiArg>({
            query: (queryArg) => ({
              url: \`/pet/\${queryArg.petId}/uploadImage\`,
              method: \\"POST\\",
              body: queryArg.body,
              params: { additionalMetadata: queryArg.additionalMetadata },
            }),
          }),
          getInventory: build.query<GetInventoryApiResponse, GetInventoryApiArg>({
            query: () => ({ url: \`/store/inventory\` }),
          }),
          placeOrder: build.mutation<PlaceOrderApiResponse, PlaceOrderApiArg>({
            query: (queryArg) => ({
              url: \`/store/order\`,
              method: \\"POST\\",
              body: queryArg.order,
            }),
          }),
          getOrderById: build.query<GetOrderByIdApiResponse, GetOrderByIdApiArg>({
            query: (queryArg) => ({ url: \`/store/order/\${queryArg.orderId}\` }),
          }),
          deleteOrder: build.mutation<DeleteOrderApiResponse, DeleteOrderApiArg>({
            query: (queryArg) => ({
              url: \`/store/order/\${queryArg.orderId}\`,
              method: \\"DELETE\\",
            }),
          }),
          createUser: build.mutation<CreateUserApiResponse, CreateUserApiArg>({
            query: (queryArg) => ({
              url: \`/user\`,
              method: \\"POST\\",
              body: queryArg.user,
            }),
          }),
          createUsersWithListInput: build.mutation<
            CreateUsersWithListInputApiResponse,
            CreateUsersWithListInputApiArg
          >({
            query: (queryArg) => ({
              url: \`/user/createWithList\`,
              method: \\"POST\\",
              body: queryArg.body,
            }),
          }),
          loginUser: build.query<LoginUserApiResponse, LoginUserApiArg>({
            query: (queryArg) => ({
              url: \`/user/login\`,
              params: { username: queryArg.username, password: queryArg.password },
            }),
          }),
          logoutUser: build.query<LogoutUserApiResponse, LogoutUserApiArg>({
            query: () => ({ url: \`/user/logout\` }),
          }),
          getUserByName: build.query<GetUserByNameApiResponse, GetUserByNameApiArg>({
            query: (queryArg) => ({ url: \`/user/\${queryArg.username}\` }),
          }),
          updateUser: build.mutation<UpdateUserApiResponse, UpdateUserApiArg>({
            query: (queryArg) => ({
              url: \`/user/\${queryArg.username}\`,
              method: \\"PUT\\",
              body: queryArg.user,
            }),
          }),
          deleteUser: build.mutation<DeleteUserApiResponse, DeleteUserApiArg>({
            query: (queryArg) => ({
              url: \`/user/\${queryArg.username}\`,
              method: \\"DELETE\\",
            }),
          }),
        }),
      });
      export type GetHealthcheckApiResponse = /** status 200 OK */ {
        message: string;
      };
      export type GetHealthcheckApiArg = {};
      export type UpdatePetApiResponse = /** status 200 Successful operation */ Pet;
      export type UpdatePetApiArg = {
        /** Update an existent pet in the store */
        pet: Pet;
      };
      export type AddPetApiResponse = /** status 200 Successful operation */ Pet;
      export type AddPetApiArg = {
        /** Create a new pet in the store */
        pet: Pet;
      };
      export type FindPetsByStatusApiResponse = /** status 200 successful operation */ Pet[];
      export type FindPetsByStatusApiArg = {
        /** Status values that need to be considered for filter */
        status?: \\"available\\" | \\"pending\\" | \\"sold\\";
      };
      export type FindPetsByTagsApiResponse = /** status 200 successful operation */ Pet[];
      export type FindPetsByTagsApiArg = {
        /** Tags to filter by */
        tags?: string[];
      };
      export type GetPetByIdApiResponse = /** status 200 successful operation */ Pet;
      export type GetPetByIdApiArg = {
        /** ID of pet to return */
        petId: number;
      };
      export type UpdatePetWithFormApiResponse = unknown;
      export type UpdatePetWithFormApiArg = {
        /** ID of pet that needs to be updated */
        petId: number;
        /** Name of pet that needs to be updated */
        name?: string;
        /** Status of pet that needs to be updated */
        status?: string;
      };
      export type DeletePetApiResponse = unknown;
      export type DeletePetApiArg = {
        apiKey?: string;
        /** Pet id to delete */
        petId: number;
      };
      export type UploadFileApiResponse = /** status 200 successful operation */ ApiResponse;
      export type UploadFileApiArg = {
        /** ID of pet to update */
        petId: number;
        /** Additional Metadata */
        additionalMetadata?: string;
        body: string;
      };
      export type GetInventoryApiResponse = /** status 200 successful operation */ {
        [key: string]: number;
      };
      export type GetInventoryApiArg = {};
      export type PlaceOrderApiResponse = /** status 200 successful operation */ Order;
      export type PlaceOrderApiArg = {
        order: Order;
      };
      export type GetOrderByIdApiResponse = /** status 200 successful operation */ Order;
      export type GetOrderByIdApiArg = {
        /** ID of order that needs to be fetched */
        orderId: number;
      };
      export type DeleteOrderApiResponse = unknown;
      export type DeleteOrderApiArg = {
        /** ID of the order that needs to be deleted */
        orderId: number;
      };
      export type CreateUserApiResponse = unknown;
      export type CreateUserApiArg = {
        /** Created user object */
        user: User;
      };
      export type CreateUsersWithListInputApiResponse = /** status 200 Successful operation */ User;
      export type CreateUsersWithListInputApiArg = {
        body: User[];
      };
      export type LoginUserApiResponse = /** status 200 successful operation */ string;
      export type LoginUserApiArg = {
        /** The user name for login */
        username?: string;
        /** The password for login in clear text */
        password?: string;
      };
      export type LogoutUserApiResponse = unknown;
      export type LogoutUserApiArg = {};
      export type GetUserByNameApiResponse = /** status 200 successful operation */ User;
      export type GetUserByNameApiArg = {
        /** The name that needs to be fetched. Use user1 for testing.  */
        username: string;
      };
      export type UpdateUserApiResponse = unknown;
      export type UpdateUserApiArg = {
        /** name that need to be deleted */
        username: string;
        /** Update an existent user in the store */
        user: User;
      };
      export type DeleteUserApiResponse = unknown;
      export type DeleteUserApiArg = {
        /** The name that needs to be deleted */
        username: string;
      };
      export type Category = {
        id?: number;
        name?: string;
      };
      export type Tag = {
        id?: number;
        name?: string;
      };
      export type Pet = {
        id?: number;
        name: string;
        category?: Category;
        photoUrls: string[];
        tags?: Tag[];
        status?: \\"available\\" | \\"pending\\" | \\"sold\\";
      };
      export type ApiResponse = {
        code?: number;
        type?: string;
        message?: string;
      };
      export type Order = {
        id?: number;
        petId?: number;
        quantity?: number;
        shipDate?: string;
        status?: \\"placed\\" | \\"approved\\" | \\"delivered\\";
        complete?: boolean;
      };
      export type User = {
        id?: number;
        username?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
        phone?: string;
        userStatus?: number;
      };
      export const {
        useGetHealthcheckQuery,
        useUpdatePetMutation,
        useAddPetMutation,
        useFindPetsByStatusQuery,
        useFindPetsByTagsQuery,
        useGetPetByIdQuery,
        useUpdatePetWithFormMutation,
        useDeletePetMutation,
        useUploadFileMutation,
        useGetInventoryQuery,
        usePlaceOrderMutation,
        useGetOrderByIdQuery,
        useDeleteOrderMutation,
        useCreateUserMutation,
        useCreateUsersWithListInputMutation,
        useLoginUserQuery,
        useLogoutUserQuery,
        useGetUserByNameQuery,
        useUpdateUserMutation,
        useDeleteUserMutation,
      } = api;

      "
    `);

    // These are all of the hooks that we expect the petstore schema to output
    const expectedHooks = [
      'useGetHealthcheckQuery',
      'useUpdatePetMutation',
      'useAddPetMutation',
      'useFindPetsByStatusQuery',
      'useFindPetsByTagsQuery',
      'useGetPetByIdQuery',
      'useUpdatePetWithFormMutation',
      'useDeletePetMutation',
      'useUploadFileMutation',
      'useGetInventoryQuery',
      'usePlaceOrderMutation',
      'useGetOrderByIdQuery',
      'useDeleteOrderMutation',
      'useCreateUserMutation',
      'useCreateUsersWithListInputMutation',
      'useLoginUserQuery',
      'useLogoutUserQuery',
      'useGetUserByNameQuery',
      'useUpdateUserMutation',
      'useDeleteUserMutation',
    ];

    const numberOfHooks = expectedHooks.filter((name) => result.stdout.indexOf(name) > -1).length;
    expect(numberOfHooks).toEqual(expectedHooks.length);
  });
});
