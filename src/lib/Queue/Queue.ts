export class Queue<T> {
	private queue: T[] = [];

	public push(item: T): boolean {
		this.queue.push(item);
		return true;
	}

	public pop(): T | undefined {
		return this.queue.shift();
	}

	public peek(): T | undefined {
		return this.queue[0];
	}

	public get length(): number {
		return this.queue.length;
	}

	public isEmpty(): boolean {
		return this.queue.length === 0;
	}
}