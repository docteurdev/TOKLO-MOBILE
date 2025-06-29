export const QueryKeys = {
 orders: {
   all: ['orders'],
   byId: (id: number) => ['orders', id],
   byTokloMan: (tokloManId: number) => ['orders', 'tokloMan', tokloManId],
   lastOrder: ['lastOrder', 'lastOrder'],
   onGoing: ['orders', 'onGoing'],
   finished: ['orders', 'finished'],
   delivered: ['orders', 'delivered'],
   calendar: ['orders', 'calendar'],
   stats: ['stats', 'wieekly'],
 },
 clients: {
   all: ['clients'],
   stat: ['clients', 'stat'],
   statByid: (id: number) => ['clients', 'stat', id],
   clientOrdersbyId: (id: number) => ['clientOrdersbyId', id],
   byUser: (userId: number) => ['clients', 'user', userId],
   // byDoctor: (doctorId: string) => ['appointments', 'doctor', doctorId],
 },
 tokloman: {
  all: ['tokloman'],
  byTokloman: ['tokloman', 'tokloman'],
  byToklomanStore: ['tokloman', 'store'],
  byToklomanUsers: ['tokloman', 'users'],
  subscriptionType: ['tokloman', 'subscriptionType'],
},

gallery: {
  all: ['gallery'],
  
},
subscriptionType: {
  all: ['subscriptionType'],
  
},
};
