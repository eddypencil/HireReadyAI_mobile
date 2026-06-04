import React, { useState, useEffect, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { Plus, X, Library, Settings } from "lucide-react";
import StageLibrary from "./StageLibrary";
import StageCard from "./StageCard";
import StageDetailsPanel from "./StageDetailsPanel";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export default function PipelineBuilder({
  job,
  stages,
  onAddStage,
  onUpdateStage,
  onDeleteStage,
  onReorderStages,
}) {
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const selectedStage = stages.find((s) => s.id === selectedStageId) || null;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const reordered = Array.from(stages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onReorderStages(reordered);
  };

  const handleAddFromLibrary = useCallback(
    async (libraryItem) => {
      await onAddStage(libraryItem);
      if (!isDesktop) setLibraryOpen(false);
    },
    [onAddStage, isDesktop]
  );

  const handleStageSelect = useCallback(
    (stage) => {
      setSelectedStageId((prev) => {
        const next = prev === stage.id ? null : stage.id;
        if (!isDesktop && next) setDetailsOpen(true);
        return next;
      });
    },
    [isDesktop]
  );

  const handleDelete = useCallback(
    (id) => {
      if (selectedStageId === id) {
        setSelectedStageId(null);
        setDetailsOpen(false);
      }
      onDeleteStage(id);
    },
    [selectedStageId, onDeleteStage]
  );

  const closeAll = useCallback(() => {
    setLibraryOpen(false);
    setDetailsOpen(false);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeAll]);

  useEffect(() => {
    if (!isDesktop && (libraryOpen || detailsOpen)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [libraryOpen, detailsOpen, isDesktop]);

  // Desktop: 3-column layout
  if (isDesktop) {
    return (
      <div className="flex h-full font-sans overflow-hidden">
        <div className="w-56 shrink-0 border-r border-gray-100 bg-white overflow-y-auto">
          <StageLibrary onAddStage={handleAddFromLibrary} />
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/50 px-8 py-6">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-dark-amethyst-950 mb-1">
              {job?.title || "Pipeline"}
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Drag stages to reorder or click to configure.
            </p>

            {stages.length === 0 ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  No stages yet
                </p>
                <p className="text-xs text-gray-400">
                  Click a stage in the library to add it here.
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="pipeline-canvas">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-col gap-3"
                    >
                      {stages.map((stage, index) => (
                        <Draggable
                          key={stage.id}
                          draggableId={stage.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <StageCard
                              stage={stage}
                              isSelected={stage.id === selectedStageId}
                              onSelect={handleStageSelect}
                              onDelete={handleDelete}
                              provided={provided}
                              snapshot={snapshot}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        <div className="w-64 shrink-0 border-l border-gray-100 bg-white overflow-y-auto">
          <StageDetailsPanel
            stage={selectedStage}
            stages={stages}
            onUpdate={onUpdateStage}
          />
        </div>
      </div>
    );
  }

  // Mobile / Tablet: single column + slide-over drawers
  return (
    <div className="flex h-full font-sans overflow-hidden relative">
      {/* Library toggle */}
      <button
        onClick={() => setLibraryOpen(true)}
        className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm text-gray-600 hover:text-dark-amethyst-700 hover:border-dark-amethyst-300 transition-all cursor-pointer"
      >
        <Library className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline">
          Library
        </span>
      </button>

      {/* Pipeline canvas */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 px-4 py-6 pt-16">
        <div className="max-w-xl mx-auto">
          <h2 className="text-lg font-bold text-dark-amethyst-950 mb-1">
            {job?.title || "Pipeline"}
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Tap a stage to configure, or add from the library.
          </p>

          {stages.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Plus className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                No stages yet
              </p>
              <p className="text-xs text-gray-400">
                Tap the Library button to add stages.
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pipeline-canvas">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-col gap-3"
                  >
                    {stages.map((stage, index) => (
                      <Draggable
                        key={stage.id}
                        draggableId={stage.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <StageCard
                            stage={stage}
                            isSelected={stage.id === selectedStageId}
                            onSelect={handleStageSelect}
                            onDelete={handleDelete}
                            provided={provided}
                            snapshot={snapshot}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Details toggle - only when a stage is selected */}
      {selectedStage && (
        <button
          onClick={() => setDetailsOpen(true)}
          className="absolute right-3 bottom-3 z-10 inline-flex items-center gap-1.5 px-3 py-2 bg-dark-amethyst-600 text-white border border-dark-amethyst-500 rounded-xl shadow-lg text-sm hover:bg-dark-amethyst-700 transition-all cursor-pointer"
        >
          <span className="text-xs font-medium hidden sm:inline">
            Settings
          </span>
          <Settings className="w-4 h-4" />
        </button>
      )}

      {/* Library drawer overlay */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
          libraryOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setLibraryOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] bg-white shadow-2xl transition-transform duration-300 ease-out ${
            libraryOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
              Stage Library
            </span>
            <button
              onClick={() => setLibraryOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close library"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <StageLibrary onAddStage={handleAddFromLibrary} />
        </div>
      </div>

      {/* Details drawer overlay */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
          detailsOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setDetailsOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
            detailsOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {selectedStage?.name || "Stage Settings"}
            </span>
            <button
              onClick={() => setDetailsOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <StageDetailsPanel
            stage={selectedStage}
            stages={stages}
            onUpdate={onUpdateStage}
          />
        </div>
      </div>
    </div>
  );
}
