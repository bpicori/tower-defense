import { Component, GameState } from "./main";

export class PlayerLife implements Component {
  update(state: GameState) {
    return state;
  }

  render(state: GameState) {
    const playerLife = document.getElementById("playerLife");

    if (playerLife) {
      playerLife.textContent = state.playerLife.toString();
    }
  }
}
