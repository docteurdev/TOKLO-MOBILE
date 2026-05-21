export const StoreKeys = {
  product:{
    all: ['product'],
    byId: (id: number) => ['product', id],
    byCategory: (categoryId: number) => ['product', 'category', categoryId],
    byStore: (storeId: number) => ['product', 'store', storeId],
  },
  order: {
    all: ['order'],
    byId: (id: number) => ['order', id],
  },
};