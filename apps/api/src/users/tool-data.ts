import { Injectable } from '@nestjs/common';
import type { ToolId } from '@lifeos/shared';

/** Every tool that stores user data implements this, so "delete my data" really erases it. */
export interface ToolDataPurger {
  readonly toolId: ToolId;
  /** Permanently erases everything this user stored in the tool. Must be safe to run twice. */
  purge(userId: string): Promise<void>;
}

@Injectable()
export class ToolDataRegistry {
  private readonly purgers = new Map<ToolId, ToolDataPurger>();

  register(purger: ToolDataPurger) {
    this.purgers.set(purger.toolId, purger);
  }

  get(toolId: ToolId): ToolDataPurger | undefined {
    return this.purgers.get(toolId);
  }
}
