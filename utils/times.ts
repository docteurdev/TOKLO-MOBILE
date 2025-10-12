/**
 * Invokes the iteratee n times, returning an array of the results of each invocation.
 * The iteratee is invoked with one argument; (index).
 */
export const times = <T>(length: number, iteratee: (index: number) => T): T[] =>
  Array.from<T, number>({ length }, (_, k) => k).map(iteratee)

export const defaultRemindTime = {
  notif_monrning: "12 30",
  notif_midday: "02 15",
  notif_evening: "02 16",
  notif_remind_days: 7,
  notif_remind_seven: 7,
  notif_remind_three: 3,
  notif_remind_two: 2,
  notif_remind_one: 1,
}
