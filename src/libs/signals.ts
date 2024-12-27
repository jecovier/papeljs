export class Signal<T> {
  private _value: T;
  private _subscribers: Set<() => void>;

  constructor(initialValue: T) {
    this._value = initialValue;
    this._subscribers = new Set();
  }

  get value(): T {
    if (Signal.currentSubscribers.length > 0) {
      // Agrega el suscriptor actual (último en la pila)
      const currentSubscriber = Signal.currentSubscribers.at(-1);
      if (currentSubscriber) {
        this._subscribers.add(currentSubscriber);
      }
    }
    return this._value;
  }

  set value(newValue: T) {
    if (newValue !== this._value) {
      this._value = newValue;
      this._notify();
    }
  }

  private _notify(): void {
    this._subscribers.forEach((subscriber) => subscriber());
  }

  static currentSubscribers: Array<() => void> = [];
}

export function createState<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}

// Función para crear valores computados reactivos
type Computed<T> = () => T;

export function createComputed<T>(fn: () => T): Computed<T> {
  const wrapper = () => {
    Signal.currentSubscribers.push(wrapper);
    wrapper._value = fn();
    Signal.currentSubscribers.pop();
  };

  wrapper._value = fn();
  return () => wrapper._value;
}

export function bindSignalToElement<T>(
  signal: Signal<T>,
  element: HTMLElement
): void {
  const updateElement = () => {
    element.textContent = String(signal.value);
  };

  Signal.currentSubscribers.push(updateElement);
  updateElement();
  Signal.currentSubscribers.pop();
}

// Ejemplo de uso
/*
  const count = new Signal<number>(0);
  const doubleCount = computed(() => count.value * 2);
  const tripleCount = computed(() => count.value * 3);
  
  console.log(doubleCount()); // 0
  console.log(tripleCount()); // 0
  
  count.value = 2;
  
  console.log(doubleCount()); // 4
  console.log(tripleCount()); // 6
*/
