import {TransactionType, Transaction} from "../../src/controller/Types";
import {addHonba} from "../../src/controller/HonbaProcessing";
import {expect} from "chai";

describe("Should process honba well", () => {
	it("should handle ron", () => {
		const ronTransaction: Transaction = {
			transactionType: TransactionType.DEAL_IN,
			hand: {fu: 30, han: 1},
			scoreDeltas: [-1000, 0, 1000, 0],
		};
		const result = addHonba(ronTransaction, 3);
		expect(result).deep.equal({
			transactionType: TransactionType.DEAL_IN,
			hand: {fu: 30, han: 1},
			scoreDeltas: [-1900, 0, 1900, 0],
		});
	});
	it("should handle tsumo", () => {
		const ronTransaction: Transaction = {
			transactionType: TransactionType.SELF_DRAW,
			hand: {fu: 30, han: 2},
			scoreDeltas: [3000, -1000, -1000, -1000],
		};
		const result = addHonba(ronTransaction, 3);
		expect(result).deep.equal({
			transactionType: TransactionType.SELF_DRAW,
			hand: {fu: 30, han: 2},
			scoreDeltas: [3900, -1300, -1300, -1300],
		});
	});
	it("should handle nagashi mangan", () => {
		const ronTransaction: Transaction = {
			transactionType: TransactionType.NAGASHI_MANGAN,
			scoreDeltas: [-4000, 12000, -4000, -4000],
		};
		const result = addHonba(ronTransaction, 3);
		expect(result).deep.equal({
			transactionType: TransactionType.NAGASHI_MANGAN,
			scoreDeltas: [-4000, 12000, -4000, -4000],
		});
	});
	it("should consider pao deal in", () => {
		const ronTransaction: Transaction = {
			transactionType: TransactionType.DEAL_IN_PAO,
			paoTarget: 2,
			scoreDeltas: [-16000, 32000, -16000, 0],
		};
		const result = addHonba(ronTransaction, 3);
		expect(result).deep.equal({
			transactionType: TransactionType.DEAL_IN_PAO,
			paoTarget: 2,
			scoreDeltas: [-16900, 32900, -16000, 0],
		});
	});
	it("should consider pao tsumo", () => {
		const ronTransaction: Transaction = {
			transactionType: TransactionType.SELF_DRAW_PAO,
			paoTarget: 2,
			scoreDeltas: [0, 32000, -32000, 0],
		};
		const result = addHonba(ronTransaction, 3);
		expect(result).deep.equal({
			transactionType: TransactionType.SELF_DRAW_PAO,
			paoTarget: 2,
			scoreDeltas: [0, 32900, -32900, 0],
		});
	});
});
