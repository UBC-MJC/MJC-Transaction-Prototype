/*
 * Please read the specs below for the functionality that the prototype should support.
 */

import {calculateHandValue, MANGAN_BASE_POINT} from "./Points";
import {
	ActionType,
	ConcludedRound,
	getEmptyScoreDelta,
	getNextWind,
	getStartingScore,
	Hand,
	NewRound,
	NUM_PLAYERS,
	Transaction,
	Wind,
} from "./Types";
import {dealershipRetains, findHeadbumpWinner, getNewHonbaCount, transformTransactions} from "./HonbaProcessing";
import {range} from "./Range";

export class JapaneseRound {
	public readonly roundWind: Wind;
	public readonly roundNumber: number;
	public readonly honba: number;
	public readonly riichiSticks: number;
	public riichis: number[];
	public tenpais: null | number[];
	public readonly transactions: Transaction[];
	private readonly dealerIndex: number;

	constructor(newRound: NewRound) {
		/**
		 * Represents a Round in a Riichi Game.
		 * @param wind the wind of the current. Can be East or South.
		 * @param round the current round. Between 1 and 4.
		 * @param honba the current honba. Can either be 0 (different win), honba of past round + 1 (dealer tenpai/ron)
		 * or honba of past round (Reshuffle, Chombo).
		 * @param riichiSticks the amount of riichi Sticks that are still on the table.
		 *
		 * Invariant: the total number of riichi sticks * 1000 + the total score of each player should add up to 100000
		 **/
		this.roundWind = newRound.roundWind;
		this.roundNumber = newRound.roundNumber;
		this.honba = newRound.honba;
		this.riichiSticks = newRound.startingRiichiSticks;
		this.riichis = [];
		this.tenpais = null;
		this.transactions = [];
		this.dealerIndex = this.roundNumber - 1;
	}

	public getDealinMultiplier(personIndex: number) {
		if (personIndex === this.dealerIndex) {
			return 6;
		}
		return 4;
	}

	public getTsumoMultiplier(personIndex: number, isDealer: boolean) {
		if (isDealer || personIndex === this.dealerIndex) {
			return 2;
		}
		return 1;
	}

	public addRon(winnerIndex: number, loserIndex: number, hand: Hand) {
		const scoreDeltas = getEmptyScoreDelta();
		const multiplier = this.getDealinMultiplier(winnerIndex);
		const handValue = calculateHandValue(multiplier, hand);
		scoreDeltas[winnerIndex] = handValue;
		scoreDeltas[loserIndex] = -handValue;
		const result: Transaction = {
			actionType: ActionType.RON,
			hand: hand,
			scoreDeltas: scoreDeltas,
		};
		this.transactions.push(result);
		return result;
	}

	public addTsumo(winnerIndex: number, hand: Hand) {
		const scoreDeltas = getEmptyScoreDelta();
		const isDealer = winnerIndex === this.dealerIndex;
		let totalScore = 0;
		for (let i = 0; i < NUM_PLAYERS; i++) {
			if (i !== winnerIndex) {
				const value = calculateHandValue(this.getTsumoMultiplier(i, isDealer), hand);
				totalScore += value;
				scoreDeltas[i] = -value;
			}
		}
		scoreDeltas[winnerIndex] = totalScore;
		const result: Transaction = {
			actionType: ActionType.TSUMO,
			hand: hand,
			scoreDeltas: scoreDeltas,
		};
		this.transactions.push(result);
		return result;
	}

	public addNagashiMangan(winnerIndex: number) {
		const scoreDeltas = getEmptyScoreDelta();
		const isDealer = winnerIndex === this.dealerIndex;
		for (let i = 0; i < NUM_PLAYERS; i++) {
			if (i !== winnerIndex) {
				const value = MANGAN_BASE_POINT * this.getTsumoMultiplier(i, isDealer);
				scoreDeltas[i] = -value;
				scoreDeltas[winnerIndex] += value;
			}
		}
		this.transactions.push({
			actionType: ActionType.NAGASHI_MANGAN,
			scoreDeltas: scoreDeltas,
		});
	}

	public addPaoDealIn(winnerIndex: number, dealInPersonIndex: number, paoPersonIndex: number, hand: Hand) {
		const scoreDeltas = getEmptyScoreDelta();
		const multiplier = this.getDealinMultiplier(winnerIndex);
		scoreDeltas[dealInPersonIndex] = -calculateHandValue(multiplier / 2, hand);
		scoreDeltas[paoPersonIndex] = -calculateHandValue(multiplier / 2, hand);
		scoreDeltas[winnerIndex] = calculateHandValue(multiplier, hand);
		this.transactions.push({
			actionType: ActionType.NAGASHI_MANGAN,
			hand: hand,
			paoTarget: paoPersonIndex,
			scoreDeltas: scoreDeltas,
		});
	}

	public addPaoTsumo(winnerIndex: number, paoPersonIndex: number, hand: Hand) {
		const scoreDeltas = getEmptyScoreDelta();
		const multiplier = this.getDealinMultiplier(winnerIndex);
		const value = calculateHandValue(multiplier, hand);
		scoreDeltas[paoPersonIndex] = -value;
		scoreDeltas[winnerIndex] = value;
		this.transactions.push({
			actionType: ActionType.NAGASHI_MANGAN,
			hand: hand,
			paoTarget: paoPersonIndex,
			scoreDeltas: scoreDeltas,
		});
	}

	public setTenpais(tenpaiIndexes: number[]) {
		this.tenpais = tenpaiIndexes;
	}

	public addRiichi(riichiPlayerIndex: number) {
		// deprecated
		this.riichis.push(riichiPlayerIndex);
	}

	public setRiichis(riichiPlayerIndexes: number[]) {
		this.riichis = riichiPlayerIndexes;
	}

	private getFinalRiichiSticks() {
		for (const transaction of this.transactions) {
			if (
				[ActionType.RON, ActionType.TSUMO, ActionType.SELF_DRAW_PAO, ActionType.DEAL_IN_PAO].includes(
					transaction.actionType
				)
			) {
				return 0;
			}
		}
		return this.riichiSticks + this.riichis.length;
	}

	public concludeGame(): ConcludedRound {
		return {
			roundWind: this.roundWind,
			roundNumber: this.roundNumber,
			honba: this.honba,
			startingRiichiSticks: this.riichiSticks,
			riichis: this.riichis,
			tenpais: this.tenpais,
			endingRiichiSticks: this.getFinalRiichiSticks(),
			transactions: transformTransactions(this.transactions, this.honba),
		};
	}
}

function addScoreDeltas(scoreDelta1: number[], scoreDelta2: number[]): number[] {
	const finalScoreDelta = getEmptyScoreDelta();
	for (const index of range(NUM_PLAYERS)) {
		finalScoreDelta[index] += scoreDelta1[index] + scoreDelta2[index];
	}
	return finalScoreDelta;
}

function reduceScoreDeltas(transactions: Transaction[]): number[] {
	return transactions.reduce<number[]>(
		(result, current) => addScoreDeltas(result, current.scoreDeltas),
		getEmptyScoreDelta()
	);
}

function generateTenpaiScoreDeltas(tenpais: null | number[]) {
	const scoreDeltas = getEmptyScoreDelta();
	if (tenpais === null || tenpais.length === 0 || tenpais.length === NUM_PLAYERS) {
		return scoreDeltas;
	}
	for (const index of range(NUM_PLAYERS)) {
		if (tenpais.includes(index)) {
			scoreDeltas[index] = 3000 / tenpais.length;
		} else {
			scoreDeltas[index] = -3000 / (4 - tenpais.length);
		}
	}
	return scoreDeltas;
}

export function generateOverallScoreDelta(concludedRound: ConcludedRound) {
	const riichiDeltas = generateTenpaiScoreDeltas(concludedRound.tenpais);
	for (const id of concludedRound.riichis) {
		riichiDeltas[id] -= 1000;
	}
	const headbumpWinner = findHeadbumpWinner(concludedRound.transactions);
	if (concludedRound.endingRiichiSticks === 0) {
		riichiDeltas[headbumpWinner] += (concludedRound.startingRiichiSticks + concludedRound.riichis.length) * 1000;
	}
	return addScoreDeltas(reduceScoreDeltas(concludedRound.transactions), riichiDeltas);
}

export function generateNextRound(concludedRound: ConcludedRound): NewRound {
	const newHonbaCount = getNewHonbaCount(
		concludedRound.roundNumber - 1,
		concludedRound.transactions,
		concludedRound.tenpais,
		concludedRound.honba
	);
	if (dealershipRetains(concludedRound.transactions, concludedRound.tenpais, concludedRound.roundNumber - 1)) {
		return {
			honba: newHonbaCount,
			roundNumber: concludedRound.roundNumber,
			roundWind: concludedRound.roundWind,
			startingRiichiSticks: concludedRound.endingRiichiSticks,
		};
	}
	return {
		honba: newHonbaCount,
		roundNumber: concludedRound.roundNumber === NUM_PLAYERS ? 1 : concludedRound.roundNumber + 1,
		roundWind:
			concludedRound.roundNumber === NUM_PLAYERS
				? getNextWind(concludedRound.roundWind.valueOf())
				: concludedRound.roundWind,
		startingRiichiSticks: concludedRound.endingRiichiSticks,
	};
}

export function isGameEnd(newRound: NewRound, concludedRounds: ConcludedRound[]): boolean { // buggy
	if (newRound.roundWind === Wind.NORTH) {
		// ends at north regardless of what happens
		return true;
	}
	const totalScore = concludedRounds.reduce<number[]>(
		(result, current) => addScoreDeltas(result, generateOverallScoreDelta(current)),
		getStartingScore()
	);
	let exceedsHanten = false;
	for (const score of totalScore) {
		if (score < 0) {
			return true;
		}
		if (score >= 30000) {
			exceedsHanten = true;
		}
	}
	if (!exceedsHanten) {
		return false;
	}
	if (newRound.roundWind === Wind.EAST || newRound.roundWind === Wind.SOUTH) {
		return false;
	}
	return true; // west, and one person's score exceeds 30k
}
