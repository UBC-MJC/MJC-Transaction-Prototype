import {describe} from "mocha";
import chaiAsPromised from "chai-as-promised";
import {expect, use} from "chai";
import {ActionType, Wind} from "../../src/controller/Types";
import {
	generateNextRound,
	generateOverallScoreDelta,
	isGameEnd,
	JapaneseRound,
} from "../../src/controller/MahjongRound";

use(chaiAsPromised);

describe("should calculate points correctly", () => {
	it("should handle normal deal in 30fu 1han 0 -> 2", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const hand = {fu: 30, han: 1};
		round.addRon(2, 0, hand);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.RON,
					hand: hand,
					scoreDeltas: [-1000, 0, 1000, 0],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-1000, 0, 1000, 0]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 0,
			startingRiichiSticks: 0,
		});
	});
	it("should handle normal deal in 30fu 1han 2 -> 0", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const hand = {fu: 30, han: 1};
		round.addRon(0, 2, hand);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.RON,
					hand: hand,
					scoreDeltas: [1500, 0, -1500, 0],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([1500, 0, -1500, 0]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 1,
			startingRiichiSticks: 0,
		});
	});
	it("should handle deal in 30fu 2han 1 -> 0, 0, 1 riichi", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 3,
			startingRiichiSticks: 0,
		});
		const hand = {fu: 30, han: 2};
		round.addRon(0, 1, hand);
		round.setRiichis([0, 1]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 3,
			startingRiichiSticks: 0,
			riichis: [0, 1],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.RON,
					hand: hand,
					scoreDeltas: [2900, -2900, 0, 0],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([3900, -3900, 0, 0]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 3,
			honba: 0,
			startingRiichiSticks: 0,
		});
	});
	it("should handle double ron", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 3,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const hand1 = {fu: 30, han: 5};
		round.addRon(0, 2, hand1);
		const hand2 = {fu: 30, han: 6};
		round.addRon(1, 2, hand2);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 3,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.RON,
					scoreDeltas: [8000, 0, -8000, 0],
					hand: hand1,
				},
				{
					actionType: ActionType.RON,
					scoreDeltas: [0, 12000, -12000, 0],
					hand: hand2,
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([8000, 12000, -20000, 0]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
	});
	it("should handle double ron with honba and riichi", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		const hand1 = {fu: 30, han: 6};
		round.addRon(2, 3, hand1);
		const hand2 = {fu: 30, han: 2};
		round.addRon(1, 3, hand2);
		round.setRiichis([1, 2, 3]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
			riichis: [1, 2, 3],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.RON,
					scoreDeltas: [0, 0, 12000, -12000],
					hand: hand1,
				},
				{
					actionType: ActionType.RON,
					scoreDeltas: [0, 2300, 0, -2300],
					hand: hand2,
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([0, 4300, 11000, -15300]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
	});
	it("should handle double ron with honba and riichi with a dealer win", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		const hand1 = {fu: 30, han: 6};
		round.addRon(3, 1, hand1);
		const hand2 = {fu: 30, han: 2};
		round.addRon(2, 1, hand2);
		round.setRiichis([1, 2, 3]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
			riichis: [1, 2, 3],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.RON,
					scoreDeltas: [0, -18000, 0, 18000],
					hand: hand1,
				},
				{
					actionType: ActionType.RON,
					scoreDeltas: [0, -2300, 2300, 0],
					hand: hand2,
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([0, -21300, 4300, 17000]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 2,
			startingRiichiSticks: 0,
		});
	});
	it("should be order agnostic for double ron", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		const hand2 = {fu: 30, han: 2};
		round.addRon(1, 3, hand2);
		const hand1 = {fu: 30, han: 6};
		round.addRon(2, 3, hand1);
		round.setRiichis([1, 2, 3]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
			riichis: [1, 2, 3],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.RON,
					scoreDeltas: [0, 2300, 0, -2300],
					hand: hand2,
				},
				{
					actionType: ActionType.RON,
					scoreDeltas: [0, 0, 12000, -12000],
					hand: hand1,
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([0, 4300, 11000, -15300]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
	});

	it("should handle tsumo 30fu 3han by dealer", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const hand = {fu: 30, han: 3};
		round.addTsumo(1, hand);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.TSUMO,
					hand: hand,
					scoreDeltas: [-2000, 6000, -2000, -2000],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-2000, 6000, -2000, -2000]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 1,
			startingRiichiSticks: 0,
		});
	});
	it("should handle tsumo 30fu 3han by non-dealer", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const hand = {fu: 30, han: 3};
		round.addTsumo(3, hand);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.TSUMO,
					hand: hand,
					scoreDeltas: [-1000, -2000, -1000, 4000],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-1000, -2000, -1000, 4000]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 3,
			honba: 0,
			startingRiichiSticks: 0,
		});
	});
	it("should handle draw with one tenpai dealer", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.setTenpais([0]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [0],
			endingRiichiSticks: 0,
			transactions: [],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([3000, -1000, -1000, -1000]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 1,
			startingRiichiSticks: 0,
		});
	});
	it("should handle draw with one tenpai by non-dealer", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.setTenpais([1]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [1],
			endingRiichiSticks: 0,
			transactions: [],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-1000, 3000, -1000, -1000]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 1,
			startingRiichiSticks: 0,
		});
	});
	it("should handle draw with all tenpai, riichi by 0", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.setRiichis([0]);
		round.setTenpais([0, 1, 2, 3]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [0],
			tenpais: [0, 1, 2, 3],
			endingRiichiSticks: 1,
			transactions: [],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-1000, 0, 0, 0]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 1,
			startingRiichiSticks: 1,
		});
	});
	it("should handle draw with no tenpai, 1 riichi stick on table", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 0,
			startingRiichiSticks: 1,
		});
		round.setTenpais([]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 0,
			startingRiichiSticks: 1,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 1,
			transactions: [],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([0, 0, 0, 0]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 3,
			honba: 1,
			startingRiichiSticks: 1,
		});
	});
	it("should handle advancing to South 1 from draw", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.setTenpais([]);
		expect(generateNextRound(round.concludeRound())).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 1,
			honba: 1,
			startingRiichiSticks: 0,
		});
	});

	it("should handle South 3 going to South 4 with p3 win 1st at 30,000", () => {
		const roundS3 = new JapaneseRound({
			roundWind: Wind.SOUTH,
			roundNumber: 3,
			honba: 0,
			startingRiichiSticks: 1,
		});
		const hand4000 = {fu: 30, han: 3};
		roundS3.addTsumo(3, hand4000);
		const endingResult = roundS3.concludeRound();
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-1000, -1000, -2000, 5000]);
		const roundS3Next = generateNextRound(endingResult);
		expect(roundS3Next).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(roundS3Next, [endingResult])).deep.equals(false);
	});
	it("should handle South 4 hanchan end with p0 win at 30,000", () => {
		const roundS4 = new JapaneseRound({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 1,
		});
		const hand4000 = {fu: 30, han: 3};
		roundS4.addTsumo(0, hand4000);
		const endingResultS4 = roundS4.concludeRound();
		expect(generateOverallScoreDelta(endingResultS4)).deep.equal([5000, -1000, -1000, -2000]);
		const roundS4Next = generateNextRound(endingResultS4);
		expect(roundS4Next).deep.equal({
			roundWind: Wind.WEST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(roundS4Next, [endingResultS4])).deep.equals(true);
	});
	it("should handle South 4 hanchan not end with p0 win but no one at 30,000", () => {
		const roundS4 = new JapaneseRound({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const hand = {fu: 30, han: 1};
		roundS4.addTsumo(0, hand);
		const endingResultS4 = roundS4.concludeRound();
		expect(generateOverallScoreDelta(endingResultS4)).deep.equal([1100, -300, -300, -500]);
		const roundS4Next = generateNextRound(endingResultS4);
		expect(roundS4Next).deep.equal({
			roundWind: Wind.WEST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(roundS4Next, [endingResultS4])).deep.equals(false);
	});
	it("should handle South 4 -> South 4 Honba 1 with p3 win less than 30,000 and 1st", () => {
		const round = new JapaneseRound({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const hand = {fu: 30, han: 1};
		round.addRon(3, 2, hand);
		const endingResult = round.concludeRound();
		expect(generateOverallScoreDelta(endingResult)).deep.equal([0, 0, -1500, 1500]);
		const nextRound = generateNextRound(endingResult);
		expect(nextRound).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(nextRound, [endingResult])).deep.equals(false);
	});
	it("should handle South 4 hanchan end with p3 win at 30,000 and 1st", () => {
		const round = new JapaneseRound({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 2,
		});
		const hand = {fu: 30, han: 2};
		round.addTsumo(3, hand);
		const endingResult = round.concludeRound();
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-1000, -1000, -1000, 5000]);
		const nextRound = generateNextRound(endingResult);
		expect(nextRound).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(nextRound, [endingResult])).deep.equals(true);
	});
	it("should handle South 4 hanchan end with p3 tenpai at 30,000 and 1st", () => {
		const roundS3 = new JapaneseRound({
			roundWind: Wind.SOUTH,
			roundNumber: 3,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const hand = {fu: 30, han: 2};
		roundS3.addRon(3, 2, hand);
		const endingResultS3 = roundS3.concludeRound();
		expect(generateOverallScoreDelta(endingResultS3)).deep.equal([0, 0, -2000, 2000]);
		const roundS4 = new JapaneseRound(generateNextRound(endingResultS3)); // S4 p3 starting at 27,000
		roundS4.setTenpais([3]);
		const endingResultS4 = roundS4.concludeRound();
		expect(generateOverallScoreDelta(endingResultS4)).deep.equal([-1000, -1000, -1000, 3000]);
		const roundS4Next = generateNextRound(endingResultS4);
		expect(roundS4Next).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(roundS4Next, [endingResultS3, endingResultS4])).deep.equals(true);
	});
	it("should handle South 4 hanchan does not end from p0 score > p3 score > 30,000", () => {
		const round = new JapaneseRound({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const hand1 = {fu: 30, han: 3};
		const hand2 = {fu: 30, han: 5};
		round.addRon(3, 2, hand1);
		round.addRon(0, 2, hand2);
		const endingResult = round.concludeRound();
		expect(generateOverallScoreDelta(endingResult)).deep.equal([8000, 0, -13800, 5800]);
		const nextRound = generateNextRound(endingResult);
		expect(nextRound).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(nextRound, [endingResult])).deep.equals(false);
	});
	it("should handle South 4 hanchan does not end from p3 not 1st by position", () => {
		const round = new JapaneseRound({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const hand1 = {fu: 30, han: 5};
		const hand2 = {fu: 30, han: 6};
		round.addRon(3, 2, hand1);
		round.addRon(0, 2, hand2);
		const endingResult = round.concludeRound();
		expect(generateOverallScoreDelta(endingResult)).deep.equal([12000, 0, -24000, 12000]);
		const nextRound = generateNextRound(endingResult);
		expect(nextRound).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(nextRound, [endingResult])).deep.equals(false);
	});
	it("should handle South 4 hanchan end with p3 no-ten and p0 at 30000", () => {
		const roundS3 = new JapaneseRound({
			roundWind: Wind.SOUTH,
			roundNumber: 3,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const handS3 = {fu: 30, han: 3};
		roundS3.addTsumo(0, handS3);
		const endingResultS3 = roundS3.concludeRound();
		expect(generateOverallScoreDelta(endingResultS3)).deep.equal([4000, -1000, -2000, -1000]);
		const roundS3Next = generateNextRound(endingResultS3);
		expect(roundS3Next).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const roundS4 = new JapaneseRound(roundS3Next);
		roundS4.setTenpais([0, 1, 2]);
		const endingResultS4 = roundS4.concludeRound();
		expect(generateOverallScoreDelta(endingResultS4)).deep.equal([1000, 1000, 1000, -3000]);
		const roundS4Next = generateNextRound(endingResultS4);
		expect(roundS4Next).deep.equal({
			roundWind: Wind.WEST,
			roundNumber: 1,
			honba: 1,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(roundS4Next, [endingResultS3, endingResultS4])).deep.equals(true);
	});
	it("should handle South 4 hanchan does not end with p3 no-ten and no one at 30,000", () => {
		const round = new JapaneseRound({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.setTenpais([0]);
		const endingResult = round.concludeRound();
		expect(generateOverallScoreDelta(endingResult)).deep.equal([3000, -1000, -1000, -1000]);
		const nextRound = generateNextRound(endingResult);
		expect(nextRound).deep.equal({
			roundWind: Wind.WEST,
			roundNumber: 1,
			honba: 1,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(nextRound, [endingResult])).deep.equals(false);
	});
	it("should handle hanchan end if next round is North 1 and no one at 30,000", () => {
		const round = new JapaneseRound({
			roundWind: Wind.WEST,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
		const hand = {fu: 30, han: 1};
		round.addRon(0, 1, hand);
		const endingResult = round.concludeRound();
		expect(generateOverallScoreDelta(endingResult)).deep.equal([1000, -1000, 0, 0]);
		const nextRound = generateNextRound(endingResult);
		expect(nextRound).deep.equal({
			roundWind: Wind.NORTH,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(nextRound, [endingResult])).deep.equals(true);
	});
	it("should handle hanchan not end p1 at 0", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.setRiichis([1]);
		const hand = {fu: 30, han: 8};
		round.addRon(3, 1, hand);
		const endingResult = round.concludeRound();
		expect(generateOverallScoreDelta(endingResult)).deep.equal([0, -25000, 0, 25000]);
		const nextRound = generateNextRound(endingResult);
		expect(nextRound).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(nextRound, [endingResult])).deep.equals(false);
	});
	it("should handle hanchan end p1 < 0", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		round.setRiichis([1]);
		const hand = {fu: 30, han: 8};
		round.addRon(3, 1, hand);
		const endingResult = round.concludeRound();
		expect(generateOverallScoreDelta(endingResult)).deep.equal([0, -25300, 0, 25300]);
		const nextRound = generateNextRound(endingResult);
		expect(nextRound).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 2,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(nextRound, [endingResult])).deep.equals(true);
	});
	// nagashi mangan tests
	it("should handle non-dealer nagashi mangan", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.addNagashiMangan(2);
		round.setTenpais([]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.NAGASHI_MANGAN,
					scoreDeltas: [-4000, -2000, 8000, -2000],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-4000, -2000, 8000, -2000]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 1,
			startingRiichiSticks: 0,
		});
	});
	it("should handle dealer nagashi mangan", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.addNagashiMangan(0);
		round.setTenpais([]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.NAGASHI_MANGAN,
					scoreDeltas: [12000, -4000, -4000, -4000],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([12000, -4000, -4000, -4000]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 1,
			startingRiichiSticks: 0,
		});
	});
	it("should handle non-dealer nagashi mangan and dealer tenpai", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.addNagashiMangan(2);
		round.setTenpais([0]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [0],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.NAGASHI_MANGAN,
					scoreDeltas: [-4000, -2000, 8000, -2000],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-4000, -2000, 8000, -2000]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 1,
			startingRiichiSticks: 0,
		});
	});
	it("should handle non-dealer nagashi mangan with riichi sticks from previous rounds", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 1,
		});
		round.addNagashiMangan(3);
		round.setTenpais([]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 1,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 1,
			transactions: [
				{
					actionType: ActionType.NAGASHI_MANGAN,
					scoreDeltas: [-4000, -2000, -2000, 8000],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-4000, -2000, -2000, 8000]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 1,
			startingRiichiSticks: 1,
		});
	});
	it("should handle non-dealer nagashi mangan and p1 p2 riichi during round", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.setRiichis([1, 2]);
		round.addNagashiMangan(3);
		round.setTenpais([1, 2]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [1, 2],
			tenpais: [1, 2],
			endingRiichiSticks: 2,
			transactions: [
				{
					actionType: ActionType.NAGASHI_MANGAN,
					scoreDeltas: [-4000, -2000, -2000, 8000],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-4000, -3000, -3000, 8000]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 1,
			startingRiichiSticks: 2,
		});
	});
	it("should handle three nagashi mangan", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.addNagashiMangan(1);
		round.addNagashiMangan(2);
		round.addNagashiMangan(3);
		round.setTenpais([]);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.NAGASHI_MANGAN,
					scoreDeltas: [-4000, 8000, -2000, -2000],
				},
				{
					actionType: ActionType.NAGASHI_MANGAN,
					scoreDeltas: [-4000, -2000, 8000, -2000],
				},
				{
					actionType: ActionType.NAGASHI_MANGAN,
					scoreDeltas: [-4000, -2000, -2000, 8000],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-12000, 4000, 4000, 4000]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 1,
			startingRiichiSticks: 0,
		});
	});
	// pao
	it("should consider pao deal in", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		const handPao = {fu: 40, han: 13};
		round.addPaoDealIn(3, 1, 0, handPao);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.DEAL_IN_PAO,
					hand: handPao,
					paoTarget: 0,
					scoreDeltas: [-24000, -24300, 0, 48300],
				},
			],
		});
	});
	it("should consider pao tsumo to one of two yakuman", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		const handPao = {fu: 40, han: 13};
		const hand = {fu: 30, han: 13};
		round.addPaoTsumo(3, 0, handPao);
		round.addTsumo(3, hand);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.SELF_DRAW_PAO,
					hand: handPao,
					paoTarget: 0,
					scoreDeltas: [-48000, 0, 0, 48000],
				},
				{
					actionType: ActionType.TSUMO,
					hand: hand,
					scoreDeltas: [-16100, -16100, -16100, 48300],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-64100, -16100, -16100, 96300]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 2,
			startingRiichiSticks: 0,
		});
	});
	it("should consider pao deal in to one of two yakuman", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
		});
		const handPao = {fu: 40, han: 13};
		round.addPaoDealIn(3, 1, 0, handPao);
		const hand = {fu: 30, han: 13};
		round.addRon(3, 1, hand);
		const endingResult = round.concludeRound();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
			riichis: [],
			tenpais: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.DEAL_IN_PAO,
					hand: handPao,
					paoTarget: 0,
					scoreDeltas: [-24000, -24000, 0, 48000],
				},
				{
					actionType: ActionType.RON,
					hand: hand,
					scoreDeltas: [0, -48300, 0, 48300],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-24000, -72300, 0, 96300]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 2,
			startingRiichiSticks: 0,
		});
	});
});
