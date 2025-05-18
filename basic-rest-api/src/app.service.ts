/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { uid } from 'radash';

export const TodoSchema = z.object({
  uuid: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['NEW', 'DONE', 'DELETED']),
});

export type TTodo = z.infer<typeof TodoSchema>;

export const TodoWithoutSchema = TodoSchema.omit({ uuid: true, status: true });
export type TTodoWithout = z.infer<typeof TodoWithoutSchema>;

interface TContent {
  items: Record<string, TTodo>;
}

@Injectable()
export class AppService {
  content: TContent = {
    items: {},
  };

  constructor() {
    void this.init();
  }

  private async init() {
    const filePath = join(process.cwd(), 'db.json');

    if (!existsSync(filePath)) {
      await writeFile(
        filePath,
        `{
        items: {}  
      }`,
      );
    }
    const result = await readFile(filePath, 'utf-8');

    this.content = JSON.parse(result || '{}');
  }

  private async onUpdate() {
    const filePath = join(process.cwd(), 'db.json');
    await writeFile(filePath, JSON.stringify(this.content));
  }

  public async create(data: TTodoWithout) {
    const result = await TodoWithoutSchema.safeParseAsync(data);

    if (!result.success) {
      throw new HttpException('Invalid data', 400);
    }
    const newTodo: TTodo = {
      uuid: uid(12),
      ...result.data,
      status: 'NEW',
    };

    this.content = {
      ...this.content,
      items: { ...this.content.items, [newTodo.uuid]: newTodo },
    };

    await this.onUpdate();

    return newTodo;
  }

  public async update(uuid: string, data: TTodoWithout) {
    const result = await TodoWithoutSchema.safeParseAsync(data);

    if (!result.success) {
      throw new HttpException('Invalid data', 400);
    }

    this.content = {
      ...this.content,
      items: {
        ...this.content.items,
        [uuid]: {
          ...this.content.items[uuid],
          ...result.data,
        },
      },
    };

    await this.onUpdate();

    return this.content.items[uuid];
  }

  public async delete(uuid: string) {
    this.content = {
      ...this.content,
      items: {
        ...this.content.items,
        [uuid]: {
          ...this.content.items[uuid],
          status: 'DELETED',
        },
      },
    };

    await this.onUpdate();

    return this.content.items[uuid];
  }

  public async changeStatus(id: string, status: TTodo['status']) {
    const result = await TodoSchema.pick({ status: true }).safeParseAsync(
      status,
    );

    if (!result.success) {
      throw new HttpException('Invalid data', 400);
    }

    if (result.data.status === 'DELETED') {
      throw new HttpException('Invalid data', 400);
    }

    this.content = {
      ...this.content,
      items: {
        ...this.content.items,
        [id]: {
          ...this.content.items[id],
          status: result.data.status,
        },
      },
    };

    await this.onUpdate();

    return this.content.items[id];
  }

  public getItem(uuid: string) {
    if (this.content.items[uuid].status === 'DELETED')
      throw new HttpException('Item not found', 404);

    return this.content.items[uuid];
  }
  public getList() {
    return Object.values(this.content.items).filter(
      (item) => item.status !== 'DELETED',
    );
  }
}
