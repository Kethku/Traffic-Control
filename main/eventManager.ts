export interface EventManager {
  Subscribe(callback: (...args: any[]) => void): number;
  Unsubscribe(id: number): void;
  Publish(...args: any[]): Promise<void[]>;
}

export class EventManager0 implements EventManager {
  currentId = 0;
  subscriptions: { [id: number]: () => void | Promise<void> } = { };

  Subscribe(callback: () => void | Promise<void>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Publish() {
    let promises: Promise<void>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      promises.push(Promise.resolve(sub()));
    }
    return Promise.all(promises);
  }
}

export class EventManager1<A> implements EventManager {
  currentId = 0;
  subscriptions: { [id: number]: (arg: A) => void | Promise<void> } = { };

  Subscribe(callback: (arg: A) => void | Promise<void>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Publish(arg: A) {
    let promises: Promise<void>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      promises.push(Promise.resolve(sub(arg)));
    }
    return Promise.all(promises);
  }
}

export class EventManager2<A1, A2> implements EventManager {
  currentId = 0;
  subscriptions: { [id: number]: (arg1: A1, arg2: A2) => void | Promise<void> } = { };

  Subscribe(callback: (arg1: A1, arg2: A2) => void | Promise<void>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Publish(arg1: A1, arg2: A2) {
    let promises: Promise<void>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      promises.push(Promise.resolve(sub(arg1, arg2)));
    }
    return Promise.all(promises);
  }
}

export class EventManager3<A1, A2, A3> implements EventManager {
  currentId = 0;
  subscriptions: { [id: number]: (arg1: A1, arg2: A2, arg3: A3) => void | Promise<void> } = { };

  Subscribe(callback: (arg1: A1, arg2: A2, arg3: A3) => void | Promise<void>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Publish(arg1: A1, arg2: A2, arg3: A3) {
    let promises: Promise<void>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      promises.push(Promise.resolve(sub(arg1, arg2, arg3)));
    }
    return Promise.all(promises);
  }
}

export class EventManager4<A1, A2, A3, A4> implements EventManager {
  currentId = 0;
  subscriptions: { [id: number]: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => void | Promise<void> } = { };

  Subscribe(callback: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => void | Promise<void>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Publish(arg1: A1, arg2: A2, arg3: A3, arg4: A4) {
    let promises: Promise<void>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      promises.push(Promise.resolve(sub(arg1, arg2, arg3, arg4)));
    }
    return Promise.all(promises);
  }
}

export class EventManager5<A1, A2, A3, A4, A5> implements EventManager {
  currentId = 0;
  subscriptions: { [id: number]: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => void | Promise<void> } = { };

  Subscribe(callback: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => void | Promise<void>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Publish(arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) {
    let promises: Promise<void>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      promises.push(Promise.resolve(sub(arg1, arg2, arg3, arg4, arg5)));
    }
    return Promise.all(promises);
  }
}

export interface PollManager<R> {
  Subscribe(callback: (...args: any[]) => R | Promise<R>): number;
  Unsubscribe(id: number): void;
  Poll(...args: any[]): Promise<R[]>;
}

export class PollManager0<R> implements PollManager<R> {
  currentId = 0;
  subscriptions: { [id: number]: () => R | Promise<R> } = { };

  Subscribe(callback: () => R | Promise<R>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Poll() {
    let result: Promise<R>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      result.push(Promise.resolve(sub()));
    }
    return Promise.all(result);
  }
}

export class PollManager1<A, R> implements PollManager<R> {
  currentId = 0;
  subscriptions: { [id: number]: (arg: A) => R | Promise<R> } = { };

  Subscribe(callback: (arg: A) => R | Promise<R>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Poll(arg: A) {
    let result: Promise<R>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      result.push(Promise.resolve(sub(arg)));
    }
    return Promise.all(result);
  }
}

export class PollManager2<A1, A2, R> implements PollManager<R> {
  currentId = 0;
  subscriptions: { [id: number]: (arg1: A1, arg2: A2) => R | Promise<R> } = { };

  Subscribe(callback: (arg1: A1, arg2: A2) => R | Promise<R>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Poll(arg1: A1, arg2: A2) {
    let result: Promise<R>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      result.push(Promise.resolve(sub(arg1, arg2)));
    }
    return Promise.all(result);
  }
}

export class PollManager3<A1, A2, A3, R> implements PollManager<R> {
  currentId = 0;
  subscriptions: { [id: number]: (arg1: A1, arg2: A2, arg3: A3) => R | Promise<R> } = { };

  Subscribe(callback: (arg1: A1, arg2: A2, arg3: A3) => R | Promise<R>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Poll(arg1: A1, arg2: A2, arg3: A3) {
    let result: Promise<R>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      result.push(Promise.resolve(sub(arg1, arg2, arg3)));
    }
    return Promise.all(result);
  }
}

export class PollManager4<A1, A2, A3, A4, R> implements PollManager<R> {
  currentId = 0;
  subscriptions: { [id: number]: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => R | Promise<R> } = { };

  Subscribe(callback: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => R | Promise<R>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Poll(arg1: A1, arg2: A2, arg3: A3, arg4: A4) {
    let result: Promise<R>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      result.push(Promise.resolve(sub(arg1, arg2, arg3, arg4)));
    }
    return Promise.all(result);
  }
}

export class PollManager5<A1, A2, A3, A4, A5, R> implements PollManager<R> {
  currentId = 0;
  subscriptions: { [id: number]: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => R | Promise<R> } = { };

  Subscribe(callback: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => R | Promise<R>) {
    this.subscriptions[this.currentId] = callback;
    let id = this.currentId;
    this.currentId++;
    return id;
  }

  Unsubscribe(id: number) {
    delete this.subscriptions[id];
  }

  Poll(arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) {
    let result: Promise<R>[] = [];
    for (let id in this.subscriptions) {
      let sub = this.subscriptions[id];
      result.push(Promise.resolve(sub(arg1, arg2, arg3, arg4, arg5)));
    }
    return Promise.all(result);
  }
}
