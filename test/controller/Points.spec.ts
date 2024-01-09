import {Hand} from "../../src/controller/Types";
import {calculateHandValue} from "../../src/controller/Points";
import {expect} from "chai";

describe("Should calculate hand correctly", () => {
	// dealer ron and tsumo
	it("should handle dealer ron 40fu 1han", () => {
		const hand: Hand = {
			fu: 40,
			han: 1,
		};
		const result = calculateHandValue(6, hand);
		expect(result).deep.equal(2000);
	});
	it("should handle dealer ron 110fu 2han", () => {
		const hand: Hand = {
			fu: 110,
			han: 2,
		};
		const result = calculateHandValue(6, hand);
		expect(result).deep.equal(10600);
	});
	it("should handle dealer tsumo 40fu 1han", () => {
		const hand: Hand = {
			fu: 40,
			han: 1,
		};
		const result = calculateHandValue(2, hand);
		expect(result).deep.equal(700);
	});
	it("should handle dealer tsumo 110fu 2han", () => {
		const hand: Hand = {
			fu: 110,
			han: 2,
		};
		const result = calculateHandValue(2, hand);
		expect(result).deep.equal(3600);
	});
	// non-dealer ron and tsumo
	it("should handle non-dealer ron 40fu 1han", () => {
		const hand: Hand = {
			fu: 40,
			han: 1,
		};
		const result = calculateHandValue(4, hand);
		expect(result).deep.equal(1300);
	});
	it("should handle non-dealer ron 110fu 2han", () => {
		const hand: Hand = {
			fu: 110,
			han: 2,
		};
		const result = calculateHandValue(4, hand);
		expect(result).deep.equal(7100);
	});
	it("should handle non-dealer tsumo 40fu 1han", () => {
		const hand: Hand = {
			fu: 40,
			han: 1,
		};
		const result = calculateHandValue(1, hand);
		expect(result).deep.equal(400);
	});
	it("should handle non-dealer tsumo 110fu 2han", () => {
		const hand: Hand = {
			fu: 110,
			han: 2,
		};
		const result = calculateHandValue(1, hand);
		expect(result).deep.equal(1800);
	});
	// ron mangan from fu
	it("should handle dealer ron 40fu 4han", () => {
		const hand: Hand = {
			fu: 40,
			han: 4,
		};
		const result = calculateHandValue(6, hand);
		expect(result).deep.equal(12000);
	});
	it("should handle dealer ron 70fu 3han", () => {
		const hand: Hand = {
			fu: 70,
			han: 3,
		};
		const result = calculateHandValue(6, hand);
		expect(result).deep.equal(12000);
	});
	it("should handle non-dealer ron 40fu 4han", () => {
		const hand: Hand = {
			fu: 40,
			han: 4,
		};
		const result = calculateHandValue(4, hand);
		expect(result).deep.equal(8000);
	});
	it("should handle non-dealer ron 70fu 3han", () => {
		const hand: Hand = {
			fu: 70,
			han: 3,
		};
		const result = calculateHandValue(4, hand);
		expect(result).deep.equal(8000);
	});
	// tsumo mangan from han
	it("should handle dealer tsumo 20fu 5han", () => {
		const hand: Hand = {
			fu: 20,
			han: 5,
		};
		const result = calculateHandValue(2, hand);
		expect(result).deep.equal(4000);
	});
	it("should handle non-dealer tsumo 20fu 5han", () => {
		const hand: Hand = {
			fu: 20,
			han: 5,
		};
		const result = calculateHandValue(1, hand);
		expect(result).deep.equal(2000);
	});
	// haneman
	it("should handle dealer tsumo 20fu 6han", () => {
		const hand: Hand = {
			fu: 20,
			han: 6,
		};
		const result = calculateHandValue(2, hand);
		expect(result).deep.equal(6000);
	});
	it("should handle dealer tsumo 20fu 7han", () => {
		const hand: Hand = {
			fu: 20,
			han: 7,
		};
		const result = calculateHandValue(2, hand);
		expect(result).deep.equal(6000);
	});
	// baiman
	it("should handle dealer tsumo 20fu 8han", () => {
		const hand: Hand = {
			fu: 20,
			han: 8,
		};
		const result = calculateHandValue(2, hand);
		expect(result).deep.equal(8000);
	});
	it("should handle dealer tsumo 20fu 9han", () => {
		const hand: Hand = {
			fu: 20,
			han: 9,
		};
		const result = calculateHandValue(2, hand);
		expect(result).deep.equal(8000);
	});
	it("should handle dealer tsumo 20fu 10han", () => {
		const hand: Hand = {
			fu: 20,
			han: 10,
		};
		const result = calculateHandValue(2, hand);
		expect(result).deep.equal(8000);
	});
	// sanbaiman
	it("should handle dealer tsumo 20fu 11han", () => {
		const hand: Hand = {
			fu: 20,
			han: 11,
		};
		const result = calculateHandValue(2, hand);
		expect(result).deep.equal(12000);
	});
	it("should handle dealer tsumo 20fu 12han", () => {
		const hand: Hand = {
			fu: 20,
			han: 12,
		};
		const result = calculateHandValue(2, hand);
		expect(result).deep.equal(12000);
	});
	// yakuman
	it("should handle dealer tsumo 20fu 13han", () => {
		const hand: Hand = {
			fu: 20,
			han: 13,
		};
		const result = calculateHandValue(2, hand);
		expect(result).deep.equal(16000);
	});
});
