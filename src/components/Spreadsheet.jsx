import React, { useState, useRef, useEffect } from "react";
import "./Spreadsheet.css";

const Spreadsheet = () => {
  // Get form fields to determine columns
  const getFormFields = () => {
    return [
      { id: 'name', label: 'Full Name' },
      { id: 'country', label: 'Country' },
      { id: 'language', label: 'Language' },
      { id: 'phone', label: 'Phone' },
      { id: 'email', label: 'Email' },
      { id: 'isContentCreator', label: 'Content Creator' },
      { id: 'youtubeChannel', label: 'YouTube Channel' },
      { id: 'os', label: 'OS' },
      { id: 'timestamp', label: 'Timestamp' }
    ];
  };

  const rows = 100; // Increased number of rows
  const columns = getFormFields();
  const cols = columns.length;

  // Initialize state from localStorage or use defaults
  const loadInitialState = () => {
    try {
      const savedState = localStorage.getItem("spreadsheetState");
      if (savedState) {
        const { grid: savedGrid, columnWidths: savedWidths, rowColors: savedColors } = JSON.parse(savedState);
        return {
          grid: savedGrid || Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ value: "", formula: "" }))),
          columnWidths: savedWidths || Array(cols).fill(120),
          rowColors: savedColors || {}
        };
      }
    } catch (error) {
      console.error("Error loading initial state:", error);
    }
    return {
      grid: Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ value: "", formula: "" }))),
      columnWidths: Array(cols).fill(120),
      rowColors: {}
    };
  };

  const initialState = loadInitialState();
  const [grid, setGrid] = useState(initialState.grid);
  const [columnWidths, setColumnWidths] = useState(initialState.columnWidths);
  const [rowColors, setRowColors] = useState(initialState.rowColors);

  const [selectedCell, setSelectedCell] = useState(null);
  const [formula, setFormula] = useState("");
  const [multiSelect, setMultiSelect] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#e6f3ff");
  const [lastSelectedRow, setLastSelectedRow] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const resizingColumn = useRef(null);
  const startX = useRef(null);
  const startWidth = useRef(null);

  const undoStack = useRef([]);
  const redoStack = useRef([]);

  // Delete selected rows
  const deleteSelectedRows = () => {
    const selectedRows = [...new Set(multiSelect.map(sel => sel.row))].sort((a, b) => a - b);
    if (selectedRows.length === 0) return;

    const newGrid = [...grid];
    const newRowColors = { ...rowColors };

    // Remove the rows
    selectedRows.reverse().forEach(rowIndex => {
      newGrid.splice(rowIndex, 1);
      // Add a new empty row at the end
      newGrid.push(Array.from({ length: cols }, () => ({ value: "", formula: "" })));
      
      // Update row colors
      delete newRowColors[rowIndex];
      // Shift up row colors for rows after the deleted row
      for (let i = rowIndex + 1; i < rows; i++) {
        if (newRowColors[i]) {
          newRowColors[i - 1] = newRowColors[i];
          delete newRowColors[i];
        }
      }
    });

    setGrid(newGrid);
    setRowColors(newRowColors);
    setMultiSelect([]);
    setSelectedCell(null);
    saveUndoState(newGrid);
  };

  // Save state function
  const saveState = () => {
    try {
      const sheetState = {
        grid,
        columnWidths,
        rowColors,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem("spreadsheetState", JSON.stringify(sheetState));
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 1000);
    } catch (error) {
      console.error("Error saving state:", error);
    }
  };

  // Save on grid changes
  useEffect(() => {
    if (grid) saveState();
  }, [grid]);

  // Save on column width changes
  useEffect(() => {
    if (columnWidths) saveState();
  }, [columnWidths]);

  // Save on row color changes
  useEffect(() => {
    if (rowColors) saveState();
  }, [rowColors]);

  // Save state before unloading
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [grid, columnWidths, rowColors]);

  // Column resizing handlers
  const handleResizeStart = (e, colIndex) => {
    e.stopPropagation();
    setIsResizing(true);
    resizingColumn.current = colIndex;
    startX.current = e.clientX;
    startWidth.current = columnWidths[colIndex];
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;
    
    const diff = e.clientX - startX.current;
    const newWidth = Math.max(50, startWidth.current + diff);
    const newColumnWidths = [...columnWidths];
    newColumnWidths[resizingColumn.current] = newWidth;
    setColumnWidths(newColumnWidths);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    resizingColumn.current = null;
    startX.current = null;
    startWidth.current = null;
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing]);

  // Load form submissions into the grid
  const loadFormSubmissions = () => {
    const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    if (submissions.length === 0) return;

    const newGrid = [...grid];
    
    // Set headers in first row
    columns.forEach((column, colIdx) => {
      newGrid[0][colIdx] = { value: column.label, formula: "" };
    });

    // Fill data starting from row 1
    submissions.forEach((submission, rowIdx) => {
      if (rowIdx + 1 >= rows) return; // Skip if we've run out of rows
      
      columns.forEach((column, colIdx) => {
        let value = submission[column.id];
        
        // Format boolean values
        if (typeof value === 'boolean') {
          value = value ? 'Yes' : 'No';
        }
        // Format timestamp
        else if (column.id === 'timestamp') {
          value = new Date(value).toLocaleString();
        }
        // Handle undefined/null values
        else if (value === undefined || value === null) {
          value = '';
        }

        newGrid[rowIdx + 1][colIdx] = { value: String(value), formula: "" };
      });
    });

    setGrid(newGrid);
    saveUndoState(newGrid);
  };

  // Select a single cell
  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
    setFormula(grid[row][col].formula || grid[row][col].value); // Show formula
    setMultiSelect([]); // Clear multi-select
    setLastSelectedRow(null);
  };

  // Select entire row
  const handleRowHeaderClick = (rowIdx, isShiftKey) => {
    if (isShiftKey && lastSelectedRow !== null) {
      // Calculate range of rows to select
      const startRow = Math.min(lastSelectedRow, rowIdx);
      const endRow = Math.max(lastSelectedRow, rowIdx);
      
      // Create selection for all cells in the range
      const newSelection = [];
      for (let row = startRow; row <= endRow; row++) {
        for (let col = 0; col < cols; col++) {
          newSelection.push({ row, col });
        }
      }
      setMultiSelect(newSelection);
    } else {
      // Select all cells in the clicked row
      const rowSelection = Array.from({ length: cols }, (_, col) => ({
        row: rowIdx,
        col,
      }));
      setMultiSelect(rowSelection);
      setLastSelectedRow(rowIdx);
    }
    setSelectedCell({ row: rowIdx, col: 0 });
  };

  // Start multi-selection or drag
  const handleMouseDown = (row, col) => {
    setSelectedCell({ row, col });
    setMultiSelect([{ row, col }]);
    setIsDragging(true);
    setLastSelectedRow(row);
  };

  // Multi-select cells or drag cells
  const handleMouseOver = (row, col) => {
    if (isDragging) {
      // Select all cells in the rows between the start and current position
      const startRow = multiSelect[0].row;
      const startCol = 0;
      const endCol = cols - 1;
      
      const newSelection = [];
      const minRow = Math.min(startRow, row);
      const maxRow = Math.max(startRow, row);
      
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          newSelection.push({ row: r, col: c });
        }
      }
      setMultiSelect(newSelection);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Update cell value with immediate save
  const handleCellChange = (row, col, value) => {
    const updatedGrid = [...grid];
    updatedGrid[row][col] = { value, formula: "" };
    setGrid(updatedGrid);
    saveUndoState(updatedGrid);
  };

  // Handle formula input
  const handleFormulaChange = (e) => {
    setFormula(e.target.value);
  };

  const applyFormula = () => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const updatedGrid = [...grid];

    updatedGrid[row][col] = {
      value: formula.startsWith("=") ? evaluateFormula(formula) : formula,
      formula, // Save formula for later
    };

    setGrid(updatedGrid);
    saveUndoState(updatedGrid);
  };

  // Evaluate the formula
  const evaluateFormula = (formula) => {
    if (!formula.startsWith("=")) return formula;

    try {
      const rangeMatch = formula.match(/([A-Z]+\d+):([A-Z]+\d+)/); // Match ranges like A1:A5
      if (rangeMatch) {
        const [, startCell, endCell] = rangeMatch;
        const rangeCells = parseRange(startCell, endCell);

        const values = rangeCells.map(([row, col]) => {
          return parseFloat(grid[row][col].value) || 0;
        });

        if (formula.startsWith("=SUM")) return values.reduce((a, b) => a + b, 0);
        if (formula.startsWith("=AVERAGE"))
          return values.reduce((a, b) => a + b, 0) / values.length;

        return "INVALID";
      }

      return "INVALID";
    } catch (error) {
      console.error("Formula evaluation error:", error);
      return "ERROR";
    }
  };

  // Parse cell range like A1:A5
  const parseRange = (startCell, endCell) => {
    const startCol = startCell.charCodeAt(0) - 65;
    const startRow = parseInt(startCell.slice(1)) - 1;

    const endCol = endCell.charCodeAt(0) - 65;
    const endRow = parseInt(endCell.slice(1)) - 1;

    const cells = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        cells.push([row, col]);
      }
    }
    return cells;
  };

  // Save undo state
  const saveUndoState = (currentGrid) => {
    undoStack.current.push(JSON.stringify(currentGrid));
    redoStack.current = []; // Clear redo stack
  };

  // Undo action
  const undo = () => {
    if (undoStack.current.length > 0) {
      const lastState = undoStack.current.pop();
      redoStack.current.push(JSON.stringify(grid));
      setGrid(JSON.parse(lastState));
    }
  };

  // Redo action
  const redo = () => {
    if (redoStack.current.length > 0) {
      const nextState = redoStack.current.pop();
      undoStack.current.push(JSON.stringify(grid));
      setGrid(JSON.parse(nextState));
    }
  };

  // Apply color to selected rows with immediate save
  const applyColorToSelectedRows = () => {
    const selectedRows = [...new Set(multiSelect.map(sel => sel.row))];
    const newRowColors = { ...rowColors };
    
    selectedRows.forEach(row => {
      newRowColors[row] = selectedColor;
    });
    
    setRowColors(newRowColors);
  };

  // Clear color from selected rows with immediate save
  const clearColorFromSelectedRows = () => {
    const selectedRows = [...new Set(multiSelect.map(sel => sel.row))];
    const newRowColors = { ...rowColors };
    
    selectedRows.forEach(row => {
      delete newRowColors[row];
    });
    
    setRowColors(newRowColors);
  };

  return (
    <div className="spreadsheet">
      {/* Formula Bar */}
      <div className="toolbar">
        <input
          type="text"
          className="formula-bar"
          value={formula}
          onChange={handleFormulaChange}
          placeholder="Enter formula or value"
        />
        <button onClick={applyFormula}>Apply</button>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          title="Choose row color"
        />
        <button onClick={applyColorToSelectedRows}>Color Rows</button>
        <button onClick={clearColorFromSelectedRows}>Clear Color</button>
        <button onClick={loadFormSubmissions}>Refresh Data</button>
        <button onClick={deleteSelectedRows} className="delete-button">Delete Selected Rows</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        {showSaveIndicator && <div className="save-indicator">Changes saved</div>}
      </div>

      {/* Grid */}
      <div
        className="grid-container"
        onMouseUp={handleMouseUp}
      >
        {/* Header Row */}
        <div className="row header-row">
          <div className="cell corner-cell"></div>
          {columns.map((column, colIdx) => (
            <div 
              key={colIdx} 
              className="cell header-cell"
              style={{ width: columnWidths[colIdx] }}
            >
              {column.label}
              <div
                className={`resizer ${resizingColumn.current === colIdx ? 'resizing' : ''}`}
                onMouseDown={(e) => handleResizeStart(e, colIdx)}
              />
            </div>
          ))}
        </div>

        {/* Rows */}
        {grid.map((row, rowIdx) => (
          <div 
            key={rowIdx} 
            className="row"
            style={{ backgroundColor: rowColors[rowIdx] || 'transparent' }}
          >
            <div 
              className={`cell header-cell row-header ${
                multiSelect.some(sel => sel.row === rowIdx) ? "row-selected" : ""
              }`}
              onClick={(e) => handleRowHeaderClick(rowIdx, e.shiftKey)}
            >
              {rowIdx + 1}
            </div>
            {row.map((cell, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`cell ${
                  selectedCell?.row === rowIdx &&
                  selectedCell?.col === colIdx
                    ? "selected"
                    : ""
                } ${
                  multiSelect.some(
                    (sel) => sel.row === rowIdx && sel.col === colIdx
                  )
                    ? "multi-selected"
                    : ""
                }`}
                style={{ width: columnWidths[colIdx] }}
                onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                onMouseOver={() => handleMouseOver(rowIdx, colIdx)}
                onClick={() => handleCellClick(rowIdx, colIdx)}
              >
                <input
                  type="text"
                  value={cell.value}
                  onChange={(e) =>
                    handleCellChange(rowIdx, colIdx, e.target.value)
                  }
                />
                {selectedCell?.row === rowIdx &&
                  selectedCell?.col === colIdx && (
                    <div
                      className="drag-marker"
                      onMouseDown={(e) => {
                        e.stopPropagation(); // Prevent multi-select
                        setIsDragging(true);
                      }}
                    ></div>
                  )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Spreadsheet;
