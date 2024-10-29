/* eslint-disable @typescript-eslint/no-explicit-any */
const table = new Map();
const indexedTable = new Map();

type InstanceObj = {
  [x in string]: jest.Mock<any>;
};

export const mockModel = (instanceObj?: InstanceObj) => {
  return {
    create: jest.fn((payload: any) => {
      const newData = { id: '1', ...payload };
      for (const key in newData) {
        indexedTable.set(newData[key], newData);
      }
      table.set(newData.id, { ...newData, ...instanceObj });
      return Promise.resolve({ ...newData, ...instanceObj });
    }),
    findAll: jest.fn(() => Promise.resolve(Array.from(table.values()))),
    findByPk: jest.fn((id: string) => Promise.resolve(table.get(id) || null)),
    findOne: jest.fn((query: any) => {
      let result: any;
      for (const key in query.where) {
        result = indexedTable.get(query.where[key]);
        if (result) {
          break;
        }
      }
      if (!result) return Promise.resolve(null);
      return Promise.resolve({ ...result, ...instanceObj });
    }),
    update: jest.fn((payload, query) => {
      let result: any;
      for (const key in query.where) {
        result = indexedTable.get(query.where[key]);
        if (result) {
          break;
        }
      }
      if (!result) return Promise.resolve<[affectedCount: number]>([0]);
      for (const key in result) {
        indexedTable.set(result[key], { ...result, ...payload });
      }
      for (const key in query.where) {
        result = indexedTable.get(query.where[key]);
        if (result) {
          table.set(result.id, { ...result, ...instanceObj });
          break;
        }
      }
      return Promise.resolve<[affectedCount: number]>([1]);
    }) as any,
    destroy: jest.fn((query: any) => {
      let result: any;
      for (const key in query.where) {
        result = indexedTable.get(query.where[key]);
        if (result) {
          break;
        }
      }
      if (!result) return Promise.resolve(0);
      for (const key in result) {
        indexedTable.delete(result[key]);
      }
      table.delete(result.id);
      return Promise.resolve(1);
    }),
  };
};
