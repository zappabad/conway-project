/**
 * TopologyGame is our namespace for the topology‐builder minigame.
 * It exposes an API function initGame(difficulty, containerId) to start a new puzzle.
 *
 * In this game:
 *  - A candidate valid topology (a collection of subsets of a finite set) is generated,
 *    then “hidden” from the user.
 *  - The base set (rendered with our custom Etruscan font) appears as a palette.
 *  - The topology is represented by several buckets:
 *      • The "empty" bucket (fixed; must be empty).
 *      • The "full" bucket (fixed; prefilled with the base set).
 *      • Additional interactive buckets that the user must fill—each bucket has a fixed number of slots.
 *  - The user drags symbols from the palette into the empty slots.
 *  - The game continuously checks the topology axioms:
 *      • The collection must contain ∅ and the full set.
 *      • It must be closed under unions and intersections.
 *    Offending buckets are highlighted in red and the corresponding property texts turn red.
 *  - There are three difficulty levels (easy, medium, hard) which determine the size of the base set
 *    and the number/size of interactive buckets.
 */

var TopologyGame = (function() {
    var puzzleData = {};
    var userTopology = {};  // mapping bucket id → array of symbols (or null if not yet filled)
    var $container;
    
    // Candidate puzzles for each difficulty level.
    var puzzles = {
      "easy": {
        baseSet: ["𐌀", "𐌁", "𐌂"],
        topology: [
           { id: "empty", elements: [] },
           { id: "A", elements: ["𐌀", "𐌁"] },
           { id: "B", elements: ["𐌁"] },
           { id: "C", elements: ["𐌁", "𐌂"] },
           { id: "full", elements: ["𐌀", "𐌁", "𐌂"] }
        ]
      },
      "medium": {
        baseSet: ["𐌀", "𐌁", "𐌂", "𐌃"],
        topology: [
           { id: "empty", elements: [] },
           { id: "A", elements: ["𐌀"] },
           { id: "B", elements: ["𐌀", "𐌁"] },
           { id: "C", elements: ["𐌀", "𐌁", "𐌂"] },
           { id: "full", elements: ["𐌀", "𐌁", "𐌂", "𐌃"] }
        ]
      },
      "hard": {
        baseSet: ["𐌀", "𐌁", "𐌂", "𐌃", "𐌄"],
        topology: [
           { id: "empty", elements: [] },
           { id: "A", elements: ["𐌀", "𐌁"] },
           { id: "B", elements: ["𐌁", "𐌂"] },
           { id: "C", elements: ["𐌀", "𐌁", "𐌂"] },
           { id: "D", elements: ["𐌁", "𐌂", "𐌃"] },
           { id: "full", elements: ["𐌀", "𐌁", "𐌂", "𐌃", "𐌄"] }
        ]
      }
    };
    
    // Initialize userTopology: for fixed buckets copy the solution;
    // for interactive buckets, initialize with nulls.
    function initUserTopology(puzzle) {
      userTopology = {};
      puzzle.topology.forEach(function(bucket) {
        if (bucket.id === "empty" || bucket.id === "full") {
           userTopology[bucket.id] = bucket.elements.slice();
        } else {
           userTopology[bucket.id] = [];
           for (var i = 0; i < bucket.elements.length; i++) {
              userTopology[bucket.id].push(null);
           }
        }
      });
    }
    
    // Render the palette (base set) as draggable items.
    function renderPalette(baseSet) {
      var $palette = $("<div id='topology-palette'></div>");
      baseSet.forEach(function(sym) {
         var $item = $("<div class='topology-palette-item' draggable='true'></div>").text(sym);
         $item.on("dragstart", function(e) {
            e.originalEvent.dataTransfer.setData("text/plain", sym);
         });
         $palette.append($item);
      });
      $container.append($palette);
    }
    
    // Render the buckets for the topology.
    function renderBuckets(puzzle) {
      var $bucketsContainer = $("<div id='buckets-container'></div>");
      puzzle.topology.forEach(function(bucket) {
        var $bucketDiv = $("<div class='bucket-container'></div>").attr("data-id", bucket.id);
        // Optionally show the bucket id as a title.
        $bucketDiv.append("<div class='bucket-title'>" + bucket.id + "</div>");
        // Create slots equal to the number of symbols required.
        var count = bucket.elements.length;
        for (var i = 0; i < count; i++) {
           var $slot = $("<div class='slot'></div>").attr("data-index", i);
           var symbol = userTopology[bucket.id][i];
           if (symbol) {
              $slot.text(symbol).addClass("slot-filled");
           }
           // Only interactive buckets (not "empty" or "full") are droppable.
           if (bucket.id !== "empty" && bucket.id !== "full") {
              $slot.on("dragover", function(e) { e.preventDefault(); });
              $slot.on("drop", function(e) {
                 e.preventDefault();
                 var sym = e.originalEvent.dataTransfer.getData("text/plain");
                 var index = $(this).attr("data-index");
                 var bucketId = $(this).closest(".bucket-container").attr("data-id");
                 userTopology[bucketId][index] = sym;
                 renderAll();
                 updatePropertyStatuses();
              });
              // Allow clearing a slot with a double-click.
              $slot.on("dblclick", function(e) {
                 var index = $(this).attr("data-index");
                 var bucketId = $(this).closest(".bucket-container").attr("data-id");
                 userTopology[bucketId][index] = null;
                 renderAll();
                 updatePropertyStatuses();
              });
           }
           $bucketDiv.append($slot);
        }
        $bucketsContainer.append($bucketDiv);
      });
      $container.append($bucketsContainer);
    }
    
    // Helper: get the user's set (array of symbols, duplicates removed and sorted) for a given bucket.
    function getUserSet(bucketId) {
      var arr = userTopology[bucketId].filter(function(x) { return x !== null; });
      var unique = [...new Set(arr)];
      unique.sort();
      return unique;
    }
    
    // Check equality of two sets (arrays) ignoring order.
    function areEqualSets(a, b) {
      if (a.length !== b.length) return false;
      var A = a.slice().sort();
      var B = b.slice().sort();
      for (var i = 0; i < A.length; i++) {
         if (A[i] !== B[i]) return false;
      }
      return true;
    }
    
    // Check the topology axioms for the user's current configuration.
    // Returns an object with statuses for the empty set, full set, union closure, and intersection closure.
    function checkTopology(puzzle) {
      var statuses = {
         empty: "valid",
         full: "valid",
         union: "valid",
         intersection: "valid"
      };
      var complete = true;
      // For interactive buckets, if any slot is null, the configuration is incomplete.
      for (var bucketId in userTopology) {
        if (bucketId !== "empty" && bucketId !== "full") {
           if (userTopology[bucketId].some(function(x){ return x === null; })) {
              complete = false;
           }
        }
      }
      // Check empty bucket must be empty.
      var emptySet = getUserSet("empty");
      if (emptySet.length !== 0) statuses.empty = complete ? "invalid" : "pending";
      // Check full bucket must equal the base set.
      var fullSet = getUserSet("full");
      if (!areEqualSets(fullSet, puzzle.baseSet)) statuses.full = complete ? "invalid" : "pending";
      // Build the collection T (all buckets as sets).
      var T = [];
      puzzle.topology.forEach(function(bucket) {
         var set = getUserSet(bucket.id);
         if ((bucket.id !== "empty" && bucket.id !== "full") && set.length !== bucket.elements.length) {
            complete = false;
         }
         T.push({ id: bucket.id, set: set });
      });
      if (!complete) {
         statuses.union = "pending";
         statuses.intersection = "pending";
      } else {
         // Check union closure: for every pair, S ∪ T should equal one of the buckets.
         for (var i = 0; i < T.length; i++) {
           for (var j = i; j < T.length; j++) {
             var unionSet = [...new Set(T[i].set.concat(T[j].set))];
             var found = T.some(function(item) {
                return areEqualSets(item.set, unionSet);
             });
             if (!found) { statuses.union = "invalid"; }
           }
         }
         // Check intersection closure: for every pair, S ∩ T should equal one of the buckets.
         for (var i = 0; i < T.length; i++) {
           for (var j = i; j < T.length; j++) {
             var intersectionSet = T[i].set.filter(function(x) { return T[j].set.includes(x); });
             var found = T.some(function(item) {
                return areEqualSets(item.set, intersectionSet);
             });
             if (!found) { statuses.intersection = "invalid"; }
           }
         }
      }
      return statuses;
    }
    
    // Update the property status texts and, if needed, highlight slots in error.
    function updatePropertyStatuses() {
      var statuses = checkTopology(puzzleData);
      $("#top-empty").attr("class", "property-status " + statuses.empty);
      $("#top-full").attr("class", "property-status " + statuses.full);
      $("#top-union").attr("class", "property-status " + statuses.union);
      $("#top-intersection").attr("class", "property-status " + statuses.intersection);
      
      // For simplicity, if union or intersection closure is invalid, mark all interactive slots with an error.
      if (statuses.union === "invalid" || statuses.intersection === "invalid") {
         $(".slot").addClass("slot-error");
      } else {
         $(".slot").removeClass("slot-error");
      }
    }
    
    // Render the entire game: palette and buckets.
    function renderAll() {
      $container.empty();
      renderPalette(puzzleData.baseSet);
      renderBuckets(puzzleData);
    }
    
    // Public API: initialize the game in a container (by id) with a given difficulty.
    function initGame(difficulty, containerId) {
      $container = $("#" + containerId);
      puzzleData = puzzles[difficulty];
      initUserTopology(puzzleData);
      renderAll();
      updatePropertyStatuses();
      // Expose userTopology for debugging.
      window._topologyUser = userTopology;
    }
    
    return {
      initGame: initGame
    };
  })();
  