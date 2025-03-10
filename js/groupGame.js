/**
 * GroupGame is our namespace for the finite group builder minigame.
 * It exposes an API function initGame(difficulty, containerId) to start a new puzzle.
 *
 * In this version:
 *  - Symbols are rendered as text using a custom font (for example, an Etruscan/Old Italic font).
 *  - The table headers (top and left) serve as the drag sources.
 *  - Holding Ctrl (or clicking with Ctrl held) sets a persistent symbol so you can drop it multiple times.
 *  - The game continuously checks the group rules (commutativity, closedness, identity, inverses, associativity)
 *    and highlights offending cells in red.
 *  - The game container is fixed to at most 400x700 pixels.
 *
 * The puzzle is generated using a cyclic group (addition mod n) and then partially cleared based on difficulty.
 */
var GroupGame = (function() {
    var puzzleData = {};
    var $container;
    // persistentSymbol holds the "sticky" symbol (as a text string) if set.
    var persistentSymbol = null;
    
    // Return a list of symbols as text strings (using Old Italic/etruscan characters).
    function getSymbols(difficulty) {
      var allSymbols = ["𐌀", "𐌁", "𐌂", "𐌃", "𐌄", "𐌅"];
      if (difficulty === "easy") {
        return allSymbols.slice(0, 4);
      } else if (difficulty === "medium") {
        return allSymbols.slice(0, 5);
      } else if (difficulty === "hard") {
        return allSymbols.slice(0, 6);
      }
      return allSymbols.slice(0, 4);
    }
  
    // Generate the full (correct) group table using a cyclic group (addition mod n).
    function generateFullTable(symbols) {
      var n = symbols.length;
      var table = [];
      for (var i = 0; i < n; i++) {
        table[i] = [];
        for (var j = 0; j < n; j++) {
          var index = (i + j) % n;
          table[i][j] = symbols[index];
        }
      }
      return table;
    }
  
    // Generate a puzzle by starting with the full table then clearing some cells.
    function generatePuzzle(difficulty) {
      var symbols = getSymbols(difficulty);
      var fullTable = generateFullTable(symbols);
      var n = symbols.length;
      // Clone the full table to puzzleTable.
      var puzzleTable = [];
      for (var i = 0; i < n; i++) {
        puzzleTable[i] = [];
        for (var j = 0; j < n; j++) {
          puzzleTable[i][j] = fullTable[i][j];
        }
      }
      // Set prefill probability based on difficulty.
      var prefillProb;
      if (difficulty === "easy") prefillProb = 0.8;
      else if (difficulty === "medium") prefillProb = 0.5;
      else if (difficulty === "hard") prefillProb = 0.3;
  
      // For each symmetric pair (or diagonal), randomly clear based on probability.
      for (var i = 0; i < n; i++) {
        for (var j = i; j < n; j++) {
          if (i === j) {
            if (Math.random() > prefillProb) {
              puzzleTable[i][j] = null;
            }
          } else {
            if (Math.random() > prefillProb) {
              puzzleTable[i][j] = null;
              puzzleTable[j][i] = null;
            }
          }
        }
      }
      return {
        symbols: symbols,
        table: puzzleTable,
        fullTable: fullTable
      };
    }
  
    // Render the puzzle (grid with headers) in the container.
    function renderPuzzle(puzzleData) {
      var symbols = puzzleData.symbols;
      var table = puzzleData.table;
      var n = symbols.length;
      // Clear container.
      $container.empty();
  
      // Create the table with a specific CSS class.
      var $table = $("<table class='group-table'></table>");
  
      // Build table header.
      var $thead = $("<thead></thead>");
      var $headerRow = $("<tr></tr>");
      // Top-left empty cell.
      $headerRow.append("<th></th>");
      // Top header cells (columns) – these are our drag sources.
      symbols.forEach(function(sym, col) {
        var $th = $("<th class='header-cell' draggable='true'></th>");
        $th.text(sym);
        $th.attr("data-col", col);
        // Attach dragstart event.
        $th.on("dragstart", function(e) {
          e.originalEvent.dataTransfer.setData("text/plain", sym);
        });
        // If user clicks with Ctrl, set persistentSymbol.
        $th.on("click", function(e) {
          if (e.ctrlKey) {
            persistentSymbol = sym;
            $(".header-cell").removeClass("sticky-active");
            $(this).addClass("sticky-active");
          }
        });
        $headerRow.append($th);
      });
      $thead.append($headerRow);
      $table.append($thead);
  
      // Build table body.
      var $tbody = $("<tbody></tbody>");
      for (var i = 0; i < n; i++) {
        var $row = $("<tr></tr>");
        // Row header – drag source.
        var $th = $("<th class='header-cell' draggable='true'></th>");
        $th.text(symbols[i]);
        $th.attr("data-row", i);
        $th.on("dragstart", function(e) {
          var idx = $(this).attr("data-row");
          var sym = symbols[idx];
          e.originalEvent.dataTransfer.setData("text/plain", sym);
        });
        $th.on("click", function(e) {
          if (e.ctrlKey) {
            var idx = $(this).attr("data-row");
            persistentSymbol = symbols[idx];
            $(".header-cell").removeClass("sticky-active");
            $(this).addClass("sticky-active");
          }
        });
        $row.append($th);
        // Data cells.
        for (var j = 0; j < n; j++) {
          var cellValue = table[i][j];
          var $cell = $("<td></td>");
          $cell.attr("data-row", i);
          $cell.attr("data-col", j);
          $cell.addClass("game-cell");
          if (cellValue) {
            $cell.addClass("cell-filled");
            $cell.text(cellValue);
          }
          // Enable dragover.
          $cell.on("dragover", function(e) {
            e.preventDefault();
          });
          // On drop: use either the persistent symbol (if set) or the dragged data.
          $cell.on("drop", function(e) {
            e.preventDefault();
            var sym;
            if (persistentSymbol) {
              sym = persistentSymbol;
            } else {
              sym = e.originalEvent.dataTransfer.getData("text/plain");
            }
            var row = parseInt($(this).attr("data-row"));
            var col = parseInt($(this).attr("data-col"));
            updateCell(puzzleData, row, col, sym);
            renderPuzzle(puzzleData); // Re-render for simplicity.
            updatePropertyStatuses(puzzleData);
            // If Ctrl was not held, clear persistentSymbol.
            if (!e.ctrlKey) {
              persistentSymbol = null;
              $(".header-cell").removeClass("sticky-active");
            }
          });
          // Clear cell on double-click.
          $cell.on("dblclick", function(e) {
            var row = parseInt($(this).attr("data-row"));
            var col = parseInt($(this).attr("data-col"));
            clearCell(puzzleData, row, col);
            renderPuzzle(puzzleData);
            updatePropertyStatuses(puzzleData);
          });
          $row.append($cell);
        }
        $tbody.append($row);
      }
      $table.append($tbody);
      $container.append($table);
    }
  
    // Update a cell with a given symbol and, for off-diagonals, update its symmetric partner.
    function updateCell(puzzleData, row, col, sym) {
      var n = puzzleData.symbols.length;
      if (puzzleData.symbols.indexOf(sym) === -1) return;
      puzzleData.table[row][col] = sym;
      if (row !== col) {
        puzzleData.table[col][row] = sym;
      }
    }
  
    // Clear a cell (and its symmetric partner if applicable).
    function clearCell(puzzleData, row, col) {
      puzzleData.table[row][col] = null;
      if (row !== col) {
        puzzleData.table[col][row] = null;
      }
    }
  
    // Check the group properties and update the UI status texts.
    // Also highlight offending cells in red.
    function updatePropertyStatuses(puzzleData) {
      var symbols = puzzleData.symbols;
      var table = puzzleData.table;
      var n = symbols.length;
      var complete = true;
      // Remove any previous error highlights.
      $(".game-cell").removeClass("cell-error");
  
      // --- Commutativity ---
      var commOk = true;
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          if (table[i][j] && table[j][i] && table[i][j] !== table[j][i]) {
            commOk = false;
            markCellError(i, j);
            markCellError(j, i);
          }
        }
      }
      var commStatus = commOk ? (complete ? "valid" : "pending") : "invalid";
      $("#commutativity").attr("class", "property-status " + commStatus);
  
      // --- Closedness ---
      var closedOk = true;
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          if (table[i][j] && symbols.indexOf(table[i][j]) === -1) {
            closedOk = false;
            markCellError(i, j);
          }
        }
      }
      var closedStatus = closedOk ? (complete ? "valid" : "pending") : "invalid";
      $("#closedness").attr("class", "property-status " + closedStatus);
  
      // Determine completeness.
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          if (!table[i][j]) { complete = false; break; }
        }
        if (!complete) break;
      }
  
      // --- Identity ---
      var identityCandidate = -1;
      for (var i = 0; i < n; i++) {
        var isIdentity = true;
        for (var j = 0; j < n; j++) {
          if (!table[i][j] || table[i][j] !== symbols[j]) { isIdentity = false; break; }
          if (!table[j][i] || table[j][i] !== symbols[j]) { isIdentity = false; break; }
        }
        if (isIdentity) { identityCandidate = i; break; }
      }
      if (identityCandidate === -1 && complete) {
        for (var j = 0; j < n; j++) {
          markCellError(0, j);
          markCellError(j, 0);
        }
      } else if (identityCandidate !== -1) {
        for (var j = 0; j < n; j++) {
          if (table[identityCandidate][j] !== symbols[j]) {
            markCellError(identityCandidate, j);
          }
          if (table[j][identityCandidate] !== symbols[j]) {
            markCellError(j, identityCandidate);
          }
        }
      }
      var identityStatus = (identityCandidate !== -1) ? "valid" : (complete ? "invalid" : "pending");
      $("#identity").attr("class", "property-status " + identityStatus);
  
      // --- Inverses ---
      var inverseOk = true;
      if (identityCandidate === -1) {
        inverseOk = false;
      } else {
        var identitySymbol = symbols[identityCandidate];
        for (var i = 0; i < n; i++) {
          var hasInverse = false;
          for (var j = 0; j < n; j++) {
            if (table[i][j] === identitySymbol) { hasInverse = true; break; }
          }
          if (!hasInverse) {
            inverseOk = false;
            for (var k = 0; k < n; k++) {
              markCellError(i, k);
            }
          }
        }
      }
      var inverseStatus = inverseOk ? (complete ? "valid" : "pending") : (complete ? "invalid" : "pending");
      $("#inverse").attr("class", "property-status " + inverseStatus);
  
      // --- Associativity ---
      var assocOk = true;
      if (complete) {
        var symToIndex = {};
        symbols.forEach(function(sym, idx) { symToIndex[sym] = idx; });
        outer:
        for (var a = 0; a < n; a++) {
          for (var b = 0; b < n; b++) {
            for (var c = 0; c < n; c++) {
              var ab = table[a][b],
                  bc = table[b][c];
              if (ab === null || bc === null) continue;
              var abIdx = symToIndex[ab],
                  bcIdx = symToIndex[bc];
              var first = table[abIdx] ? table[abIdx][c] : null;
              var second = table[a] ? table[a][bcIdx] : null;
              if (first !== second) {
                assocOk = false;
                markCellError(a, b);
                if (abIdx !== undefined) markCellError(abIdx, c);
                markCellError(b, c);
                if (bcIdx !== undefined) markCellError(a, bcIdx);
                break outer;
              }
            }
          }
        }
      }
      var assocStatus = complete ? (assocOk ? "valid" : "invalid") : "pending";
      $("#associativity").attr("class", "property-status " + assocStatus);
    }
  
    // Helper function to mark a cell as having an error.
    function markCellError(row, col) {
      $(".game-cell").filter(function() {
        return $(this).attr("data-row") == row && $(this).attr("data-col") == col;
      }).addClass("cell-error");
    }
  
    // Public API: initialize the game in a container (by id) with a given difficulty.
    function initGame(difficulty, containerId) {
      $container = $("#" + containerId);
      puzzleData = generatePuzzle(difficulty);
      persistentSymbol = null;
      $(".header-cell").removeClass("sticky-active");
      renderPuzzle(puzzleData);
      updatePropertyStatuses(puzzleData);
      window._puzzleData = puzzleData;
    }
  
    return {
      initGame: initGame
    };
  })();
  