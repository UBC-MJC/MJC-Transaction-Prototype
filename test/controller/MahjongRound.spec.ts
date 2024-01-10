import {describe} from "mocha";
import chaiAsPromised from "chai-as-promised";
import {expect, use} from "chai";
import {ActionType, Wind} from "../../src/controller/Types";
import {generateNextRound, generateOverallScoreDelta, isGameEnd, JapaneseRound} from "../../src/controller/MahjongRound";

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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 3,
			startingRiichiSticks: 0,
			riichis: [0, 1],
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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 3,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
			riichis: [1, 2, 3],
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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
			riichis: [1, 2, 3],
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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 1,
			startingRiichiSticks: 0,
			riichis: [1, 2, 3],
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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
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
	it("should handle draw with one tenpai by non-dealer", () => {
		const round = new JapaneseRound({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
		});
		round.setTenpais([1]);
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.TENPAI,
					scoreDeltas: [-1000, 3000, -1000, -1000],
				},
			],
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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 1,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [0],
			endingRiichiSticks: 1,
			transactions: [
				{
					actionType: ActionType.TENPAI,
					scoreDeltas: [0, 0, 0, 0],
				},
			],
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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 2,
			honba: 0,
			startingRiichiSticks: 1,
			riichis: [],
			endingRiichiSticks: 1,
			transactions: [
				{
					actionType: ActionType.TENPAI,
					scoreDeltas: [0, 0, 0, 0],
				},
			],
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
		const endingResult = round.concludeGame();
		expect(endingResult).deep.equal({
			roundWind: Wind.EAST,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
			riichis: [],
			endingRiichiSticks: 0,
			transactions: [
				{
					actionType: ActionType.TENPAI,
					scoreDeltas: [0, 0, 0, 0],
				},
			],
		});
		expect(generateOverallScoreDelta(endingResult)).deep.equal([0, 0, 0, 0]);
		expect(generateNextRound(endingResult)).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 1,
			honba: 1,
			startingRiichiSticks: 0,
		});
	});

	it("should handle South 3 going to South 4 with p3 at 30,000", () => {
		const roundS3 = new JapaneseRound({
			roundWind: Wind.SOUTH,
			roundNumber: 3,
			honba: 0,
			startingRiichiSticks: 0,
		});
		roundS3.setRiichis([0]);
		const hand4000 = {fu: 30, han: 3};
		roundS3.addTsumo(3, hand4000);
		const endingResult = roundS3.concludeGame();
		expect(generateOverallScoreDelta(endingResult)).deep.equal([-2000, -1000, -2000, 5000]);
		const roundS4 = generateNextRound(endingResult);
		expect(roundS4).deep.equal({
			roundWind: Wind.SOUTH,
			roundNumber: 4,
			honba: 0,
			startingRiichiSticks: 0,
		});
		expect(isGameEnd(roundS4, [endingResult])).deep.equals(false);
	});
	// it("should handle South 4 hanchan end with p0 win at 30,000", () => {

	// });
	// it("should handle South 4 -> South 4 Honba 1 with p3 win less than 30,000", () => {

	// });
	// it("should handle South 4 hanchan end with p3 win at 30,000", () => {

	// });
	// it("should handle South 4 hanchan end with p3 tenpai at 30,000", () => {

	// });
	// it("should handle South 4 hanchan end with p0 tenpai at 30,000 and p3 no-ten", () => {

	// });
	// it("should handle South 4 -> West 1 no one at 30,000 with p3 no-ten from 30,000 -> 29,000 and 2 riichi sticks", () => {

	// });
	// it("should handle hanchan end if next round is North 1", () => {

	// });
});
