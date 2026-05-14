import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import useUndo from 'use-undo';
import { Plus, Undo2, Redo2, Trash2, Edit3, GripVertical, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { BoardData, Task, INITIAL_DATA, Column } from './types';
import { registerWebMCPTools } from './webmcp-adapter';

export default function App() {
  const [
    boardState,
    {
      set: setBoard,
      undo,
      redo,
      canUndo,
      canRedo,
    },
  ] = useUndo<BoardData>(INITIAL_DATA);

  const { present: board } = boardState;
  const [isInitialized, setIsInitialized] = useState(false);
  const isRemoteRef = useRef(false);

  // Load from central DB
  useEffect(() => {
    console.log("[Kanban App] Initializing board state fetch from central DB...");
    fetch('/api/board-state')
      .then(res => res.json())
      .then(data => {
        if (data && data.columns) {
          console.log("[Kanban App] Successfully loaded board state from central DB:", data);
          setBoard(data);
        } else {
          console.log("[Kanban App] Central DB empty, starting fresh");
        }
        setIsInitialized(true);
      })
      .catch(e => {
        console.error('[Kanban App] Failed to load central board state:', e);
        setIsInitialized(true);
      });
  }, []);

  // Save to central DB
  useEffect(() => {
    if (isInitialized) {
      if (isRemoteRef.current) {
        console.log("[Kanban App] Skipping broadcast (update originated remotely)");
        isRemoteRef.current = false;
      } else {
        console.log("[Kanban App] Pushing local board update to standalone server...");
        fetch('/api/board-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: board })
        }).catch(e => console.error(e));
      }
    }
  }, [board, isInitialized]);

  // Real-time WebSocket sync
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    let ws: WebSocket | null = null;
    let isSubscribed = true;

    function connect() {
      if (!isSubscribed) return;
      ws = new WebSocket(`${protocol}//${host}/ws/board`);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'webmcp_sync' && data.payload && data.payload.columns) {
            console.log("[Kanban Board] Received central state update via WebMCP sync WebSocket!");
            isRemoteRef.current = true;
            setBoard(data.payload);
          }
        } catch (e) {}
      };
      ws.onclose = () => {
        console.log("[Kanban Board] WebSocket closed, reconnecting...");
        if (isSubscribed) {
          setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      isSubscribed = false;
      if (ws) ws.close();
    };
  }, [setBoard]);

  // Handles task actions
  const moveTaskInternal = useCallback((
    taskId: string, 
    sourceColId: string, 
    destColId: string, 
    destIndex: number
  ) => {
    const sourceCol = board.columns[sourceColId];
    const destCol = board.columns[destColId];

    if (!sourceCol || !destCol) return;

    if (sourceCol === destCol) {
      const newTaskIds = Array.from(sourceCol.taskIds);
      const currentIndex = newTaskIds.indexOf(taskId);
      if (currentIndex === -1) return;
      
      newTaskIds.splice(currentIndex, 1);
      newTaskIds.splice(destIndex, 0, taskId);

      const newColumn = {
        ...sourceCol,
        taskIds: newTaskIds,
      };

      setBoard({
        ...board,
        columns: {
          ...board.columns,
          [newColumn.id]: newColumn,
        },
      });
    } else {
      const startTaskIds = Array.from(sourceCol.taskIds);
      const currentIndex = startTaskIds.indexOf(taskId);
      if (currentIndex === -1) return;
      
      startTaskIds.splice(currentIndex, 1);
      const newStart = {
        ...sourceCol,
        taskIds: startTaskIds,
      };

      const finishTaskIds = Array.from(destCol.taskIds);
      finishTaskIds.splice(destIndex, 0, taskId);
      const newFinish = {
        ...destCol,
        taskIds: finishTaskIds,
      };

      setBoard({
        ...board,
        columns: {
          ...board.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      });
    }
  }, [board, setBoard]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveTaskInternal(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
  };

  const addTask = useCallback((columnId: string, content: string) => {
    if (!content.trim()) return;
    const taskId = `task-${uuidv4()}`;
    const task: Task = {
      id: taskId,
      content,
      createdAt: Date.now(),
    };
    setBoard({
      ...board,
      tasks: { ...board.tasks, [taskId]: task },
      columns: {
        ...board.columns,
        [columnId]: {
          ...board.columns[columnId],
          taskIds: [...board.columns[columnId].taskIds, taskId],
        },
      },
    });
  }, [board, setBoard]);

  const editTask = useCallback((taskId: string, content: string) => {
    setBoard({
      ...board,
      tasks: {
        ...board.tasks,
        [taskId]: { ...board.tasks[taskId], content },
      },
    });
  }, [board, setBoard]);

  const deleteTask = useCallback((taskId: string) => {
    const newTasks = { ...board.tasks };
    delete newTasks[taskId];

    const newColumns = { ...board.columns };
    Object.keys(newColumns).forEach(colId => {
      newColumns[colId] = {
        ...newColumns[colId],
        taskIds: newColumns[colId].taskIds.filter(id => id !== taskId),
      };
    });

    setBoard({
      ...board,
      tasks: newTasks,
      columns: newColumns,
    });
  }, [board, setBoard]);

  // WebMCP Registration
  useEffect(() => {
    registerWebMCPTools({ board, addTask, editTask, deleteTask, moveTaskInternal, undo, redo });
  }, [board, addTask, editTask, deleteTask, moveTaskInternal, undo, redo]);

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen p-6 md:p-10 flex flex-col gap-10 max-w-7xl mx-auto overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">WebMCP Kanban</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium">Real-Time Collab • AI Shadowing</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">WebMCP Active</span>
          </div>

          <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-4 py-2 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold text-slate-700 disabled:opacity-20 disabled:pointer-events-none"
            >
              <Undo2 size={14} />
              Undo
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-4 py-2 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold text-slate-700 disabled:opacity-20 disabled:pointer-events-none"
            >
              Redo
              <Redo2 size={14} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start h-full pb-8">
            {board.columnOrder.map(columnId => {
              const column = board.columns[columnId];
              const tasks = column.taskIds.map(taskId => board.tasks[taskId]);

              return (
                <KanbanColumn 
                  key={column.id} 
                  column={column} 
                  tasks={tasks} 
                  onAddTask={addTask}
                  onEditTask={editTask}
                  onDeleteTask={deleteTask}
                />
              );
            })}
          </div>
        </DragDropContext>
      </main>
    </div>
  );
}

interface ColumnProps {
  key?: string;
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string, content: string) => void;
  onEditTask: (taskId: string, content: string) => void;
  onDeleteTask: (taskId: string) => void;
}

function KanbanColumn({ column, tasks, onAddTask, onEditTask, onDeleteTask }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');

  const handleAdd = () => {
    onAddTask(column.id, newContent);
    setNewContent('');
    setIsAdding(false);
  };

  const statusColor = column.id === 'column-1' ? 'bg-slate-400' : column.id === 'column-2' ? 'bg-indigo-600' : 'bg-emerald-500';
  const badgeColor = column.id === 'column-1' ? 'bg-slate-100 text-slate-600' : column.id === 'column-2' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
          <span className={`w-1 h-4 ${statusColor} rounded-full shadow-sm`}></span>
          {column.title}
          <span className={`${badgeColor} px-2 py-0.5 rounded text-[10px] font-bold tabular-nums`}>
            {tasks.length}
          </span>
        </h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-indigo-600"
        >
          <Plus size={16} />
        </button>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-4 min-h-[400px] transition-all duration-300 rounded-2xl p-1.5 ${
              snapshot.isDraggingOver ? 'bg-slate-100/80 ring-1 ring-slate-200' : 'bg-transparent'
            }`}
          >
            <AnimatePresence mode="popLayout">
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 ring-1 ring-indigo-500/5"
                >
                  <textarea
                    autoFocus
                    placeholder="Task description..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAdd()}
                    className="w-full text-sm resize-none focus:outline-none bg-transparent text-slate-800 placeholder:text-slate-400 min-h-[70px]"
                  />
                  <div className="flex justify-end gap-3 mt-3">
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAdd}
                      className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"
                    >
                      Add Task
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {tasks.map((task, index) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                index={index} 
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
            
            {!isAdding && tasks.length === 0 && (
               <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-slate-300 p-8">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">+ Empty Column</p>
               </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

interface TaskItemProps {
  key?: string;
  task: Task;
  index: number;
  onEdit: (taskId: string, content: string) => void;
  onDelete: (taskId: string) => void;
}

function TaskItem({ task, index, onEdit, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

  const handleUpdate = () => {
    onEdit(task.id, editContent);
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          layout
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group relative bg-white p-5 rounded-2xl border transition-all duration-300 ${
            snapshot.isDragging 
              ? 'shadow-2xl shadow-indigo-500/10 ring-2 ring-indigo-500/50 rotate-1 border-indigo-500/50 z-50' 
              : 'shadow-sm shadow-slate-200/50 border-slate-200 hover:border-slate-300 hover:shadow-md hover:bg-slate-50/50'
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-4">
              <textarea
                autoFocus
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-sm resize-none focus:outline-none bg-transparent text-slate-800 leading-relaxed"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={16} />
                </button>
                <button onClick={handleUpdate} className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                  <Check size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 items-start">
              <div {...provided.dragHandleProps} className="mt-1 text-slate-300 group-hover:text-slate-400 transition-colors cursor-grab active:cursor-grabbing">
                <GripVertical size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-slate-800 leading-relaxed break-words font-medium">{task.content}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded uppercase tracking-wider border border-slate-200">
                      ID: {task.id.split('-').pop()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => onDelete(task.id)} 
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </Draggable>
  );
}
