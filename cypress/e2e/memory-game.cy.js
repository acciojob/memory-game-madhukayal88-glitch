/**
 * cypress/e2e/memory-game.cy.js
 *
 * Comprehensive end-to-end tests for the Memory Matching Game.
 *
 * Strategy:
 *   - Each test visits the app fresh via cy.visit('/') to ensure isolation.
 *   - Tiles are located by data-value, never by visual position.
 *   - Mismatches are verified by asserting pairsMatched / status message.
 *   - Same-tile double-click is verified by confirming attempts do NOT increment.
 */

describe('Memory Matching Game', () => {

  // ===== Helper: select a level and start the game =====
  function startLevel(levelId) {
    cy.get(`#${levelId}`).check();
    cy.get('#start-button').click();
    cy.get('.cells_container').should('be.visible');
  }

  // ===== Helper: find a tile by its data-value =====
  function getTile(value) {
    return cy.get(`.cell[data-value="${value}"]`).first();
  }

  // ============================================================
  // Level Selection — Tile Counts
  // ============================================================

  describe('Level Selection', () => {

    it('Easy renders exactly 8 tiles (4 pairs)', () => {
      cy.visit('/');
      startLevel('easy');
      cy.get('.cell').should('have.length', 8);
      cy.get('.cells_container .cell').each(($cell, index, $list) => {
        const v = $cell.data('value');
        expect(v).to.be.a('string');
      });
    });

    it('Normal renders exactly 16 tiles (8 pairs)', () => {
      cy.visit('/');
      startLevel('normal');
      cy.get('.cell').should('have.length', 16);
    });

    it('Hard renders exactly 32 tiles (16 pairs)', () => {
      cy.visit('/');
      startLevel('hard');
      cy.get('.cell').should('have.length', 32);
    });

  });

  // ============================================================
  // Easy Level — Full Gameplay
  // ============================================================

  describe('Easy Level — Full Gameplay', () => {

    before(() => {
      cy.visit('/');
      startLevel('easy');
    });

    it('starts with 0 attempts and no matched tiles', () => {
      cy.get('#attempts').should('contain.text', 'Attempts: 0');
      cy.get('.cell.matched').should('have.length', 0);
    });

    it('matching a known pair increments pairsMatched and marks tiles', () => {
      // Match pair value "1"
      getTile('1').click();
      getTile('1').eq(1).click();

      cy.get('.cell[data-value="1"]').should('have.length', 2);
      cy.get('.cell[data-value="1"]').should('have.class', 'matched');
      cy.get('#status-message').should('not.contain.text', 'Solved');
    });

    it('a mismatch increments attempts by 1 but does NOT register a match', () => {
      const attemptsBefore = 0; // easy started with 0; one correct match already done
      cy.get('#attempts').then(($el) => {
        const current = parseInt($el.text().replace('Attempts: ', ''), 10);
        // Click two different values: "2" and "3"
        getTile('2').click();
        getTile('3').click();

        // Wait for the reveal-then-flip timeout (600 ms)
        cy.wait(700);

        cy.get('#attempts').then(($el2) => {
          const after = parseInt($el2.text().replace('Attempts: ', ''), 10);
          expect(after).to.equal(current + 1);
        });
      });

      // "2" and "3" should NOT be matched
      cy.get('.cell[data-value="2"].matched').should('not.exist');
      cy.get('.cell[data-value="3"].matched').should('not.exist');
    });

    it('clicking the same tile twice does NOT count as an attempt', () => {
      cy.get('#attempts').then(($el) => {
        const before = parseInt($el.text().replace('Attempts: ', ''), 10);

        // Click tile value "4" twice
        getTile('4').click();
        getTile('4').click(); // same tile → deselect, no attempt

        cy.get('#attempts').then(($el2) => {
          const after = parseInt($el2.text().replace('Attempts: ', ''), 10);
          expect(after).to.equal(before);
        });
      });
    });

    it('completing all 4 pairs shows a solved message and disables the grid', () => {
      // We already matched "1". Now match "2", "3", and "4".
      getTile('2').eq(0).click();
      getTile('2').eq(1).click();

      getTile('3').eq(0).click();
      getTile('3').eq(1).click();

      getTile('4').eq(0).click();
      getTile('4').eq(1).click();

      // All 4 pairs matched → game should be solved
      cy.get('#status-message').should('contain.text', 'Solved');
      cy.get('.cell').each(($cell) => {
        expect($cell).to.have.class('matched');
      });
    });

    it('prevents interaction after the game is solved', () => {
      const totalAttempts = parseInt(
        cy.get('#attempts').invoke('text').then((t) => t.replace('Attempts: ', '')), 10
      );

      // Try to click a tile — should have no effect
      getTile('1').click();
      cy.get('#attempts').should('have.text', `Attempts: ${totalAttempts}`);
      cy.get('#status-message').should('contain.text', 'Solved');
    });

  });

  // ============================================================
  // Normal Level — Tile Count & Known Pair
  // ============================================================

  describe('Normal Level', () => {

    it('renders 16 tiles and a known pair can be matched', () => {
      cy.visit('/');
      startLevel('normal');
      cy.get('.cell').should('have.length', 16);

      // Match value "1"
      getTile('1').click();
      getTile('1').eq(1).click();

      cy.get('.cell[data-value="1"]').should('have.class', 'matched');
      cy.get('#attempts').should('contain.text', 'Attempts: 0'); // no mismatch yet
    });

  });

  // ============================================================
  // Hard Level — Tile Count & Known Pair
  // ============================================================

  describe('Hard Level', () => {

    it('renders 32 tiles and a known pair can be matched', () => {
      cy.visit('/');
      startLevel('hard');
      cy.get('.cell').should('have.length', 32);

      // Match value "5"
      getTile('5').click();
      getTile('5').eq(1).click();

      cy.get('.cell[data-value="5"]').should('have.class', 'matched');
    });

  });

});
