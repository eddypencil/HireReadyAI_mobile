import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ComparisonCard from "./ComparisonCard";

export default function SideBySideComparison({ selectedCandidates, onReorder }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const reordered = Array.from(selectedCandidates);
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, removed);

    onReorder(reordered);
  };

  if (!selectedCandidates || selectedCandidates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 font-sans">
        <p className="text-sm">Select candidates from the table above to compare them side-by-side.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 font-sans">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#0f172a] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          Side-by-side comparison
        </h3>
        <p className="text-sm text-gray-500">
          Select 2-3 candidates to compare dimensions in detail. Drag to reorder.
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="comparison-board" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-wrap gap-6 pb-4 min-h-[200px]"
            >
              {selectedCandidates.map((candidate, index) => (
                <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                  {(provided, snapshot) => (
                    <ComparisonCard 
                      application={candidate} 
                      provided={provided} 
                      isDragging={snapshot.isDragging}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
