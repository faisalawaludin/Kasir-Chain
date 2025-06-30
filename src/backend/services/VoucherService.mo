import Text "mo:base/Text";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Types "../types/Types";

module {
    public class VoucherService() {

        let vouchers : Types.VoucherMap = HashMap.HashMap<Text, Types.VoucherData>(
            10,
            Text.equal,
            Text.hash,
        );

        public func setVouchers(vs : [Types.VoucherData]) : () {
            for (v in vs.vals()) {
                vouchers.put(v.id, v);
            };
        };

        public func createVoucher(v : Types.VoucherData) : Result.Result<(), Text> {
            if (vouchers.get(v.id) != null) {
                return #err("Voucher dengan ID ini sudah ada.");
            };
            vouchers.put(v.id, v);
            return #ok(());
        };

        public func readVoucher(id : Text) : Result.Result<Types.VoucherData, Text> {
            switch (vouchers.get(id)) {
                case (?v) { #ok(v) };
                case null { #err("Voucher tidak ditemukan.") };
            };
        };

        public func updateVoucher(v : Types.VoucherData) : Result.Result<(), Text> {
            if (vouchers.get(v.id) == null) {
                return #err("Voucher tidak ditemukan.");
            };
            vouchers.put(v.id, v);
            return #ok(());
        };

        public func deleteVoucher(id : Text) : Result.Result<(), Text> {
            switch (vouchers.remove(id)) {
                case (?_) { #ok(()) };
                case null { #err("Voucher tidak ditemukan.") };
            };
        };

        public func listVouchers() : [Types.VoucherData] {
            Iter.toArray(vouchers.vals());
        };
    };
};
