import webmcp from '@webmcp/client';
import { BoardData } from './types';

export interface KanbanWebMCPContext {
  board: BoardData;
  addTask: (columnId: string, content: string) => void;
  editTask: (taskId: string, content: string) => void;
  deleteTask: (taskId: string) => void;
  moveTaskInternal: (taskId: string, sourceColId: string, destColId: string, destIndex: number) => void;
  undo: () => void;
  redo: () => void;
}

export function registerWebMCPTools({ board, addTask, editTask, deleteTask, moveTaskInternal, undo, redo }: KanbanWebMCPContext) {
  webmcp.init({
    manifest: {
      appName: "WebMCP Kanban",
      systemInstruction: `You are an AI proactive shadowing companion in charge of a collaborative Kanban web application.
            
You monitor the meeting audio in real-time to automatically and proactively identify actionable updates for the application.

You must NEVER answer with audio or speak. Always remain completely silent.

Observe the discussions between participants. Whenever someone mentions creating, moving, editing, or deleting a task (for example: "I need to create a new task to start the project", "Let's add a task", or "Move task to Done"):
1. IMMEDIATELY execute the appropriate tool from your registered toolset (such as addTask, moveTask, editTask, deleteTask).
2. If a parameter or column is missing or ambiguously stated by participants, use your best judgement and the recent history of discussion to infer the missing context. For example, if a column is not specified when adding a task, default to 'column-1' (To Do) or infer the most logical column based on conversation flow.
3. Before moving, editing, or deleting a task, you can execute getBoardSummary to discover current task IDs and column structures if needed.
4. If a participant requests an action on multiple tasks or 'all tasks' (e.g., 'move all tasks to Done'), you must first call getBoardSummary to find all task IDs, and then call the appropriate tool (e.g., moveTask) for EACH task individually.
5. Rely entirely on the descriptions and parameters of your registered tools. Do not assume any hardcoded workflows.
6. Do not say anything or generate audio responses. Just execute the tools silently.`
    }
  });

  webmcp.registerTool({
    name: 'addTask',
    description: 'Add a task to a column',
    parameters: {
      columnId: { type: 'string', description: "The ID of the column (e.g., 'column-1' for To Do, 'column-2' for In Progress, 'column-3' for Done)" },
      content: { type: 'string', description: "The text content of the task to add" }
    },
    execute: (columnId, content) => {
      console.log(`[WebMCP Tool Execution] addTask called with columnId: ${columnId}, content: "${content}"`);
      addTask(columnId, content);
    },
  });

  webmcp.registerTool({
    name: 'moveTask',
    description: 'Move a task',
    parameters: {
      taskId: { type: 'string', description: "The ID of the task to move" },
      sourceColumnId: { type: 'string', description: "The column ID the task is currently in (column-1, column-2, column-3)" },
      destinationColumnId: { type: 'string', description: "The destination column ID (column-1, column-2, column-3)" },
      destinationIndex: { type: 'number', description: "The position index in the destination column (0-indexed)" }
    },
    execute: (taskId, sourceColId, destColId, destIndex) => {
      console.log(`[WebMCP Tool Execution] moveTask called with taskId: ${taskId}, from: ${sourceColId}, to: ${destColId} at index ${destIndex}`);
      moveTaskInternal(taskId, sourceColId, destColId, destIndex);
    },
  });

  webmcp.registerTool({
    name: 'deleteTask',
    description: 'Delete a task',
    parameters: {
      taskId: { type: 'string', description: "The ID of the task to delete" }
    },
    execute: (taskId) => {
      console.log(`[WebMCP Tool Execution] deleteTask called for taskId: ${taskId}`);
      deleteTask(taskId);
    },
  });

  webmcp.registerTool({
    name: 'editTask',
    description: 'Edit a task content',
    parameters: {
      taskId: { type: 'string', description: "The ID of the task to edit" },
      newContent: { type: 'string', description: "The new text content for the task" }
    },
    execute: (taskId, newContent) => {
      console.log(`[WebMCP Tool Execution] editTask called for taskId: ${taskId}, newContent: "${newContent}"`);
      editTask(taskId, newContent);
    },
  });

  webmcp.registerTool({ name: 'undo', description: 'Undo last action', parameters: {}, execute: undo });
  webmcp.registerTool({ name: 'redo', description: 'Redo last action', parameters: {}, execute: redo });
  webmcp.registerTool({
    name: 'getBoardSummary',
    description: 'Get a summary of columns and tasks, including task IDs',
    parameters: {},
    execute: () => {
      return board.columnOrder.map(colId => {
        const col = board.columns[colId];
        return {
          id: colId,
          title: col.title,
          tasks: col.taskIds.map(id => ({ id, content: board.tasks[id].content }))
        };
      });
    }
  });
}
