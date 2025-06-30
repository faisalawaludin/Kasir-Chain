import Text "mo:base/Text";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Types "../types/Types";

module {
    public class OrderService() {
        let orders = HashMap.HashMap<Text, Types.OrderData>(10, Text.equal, Text.hash);

        public func setOrders(vs : [Types.OrderData]) : () {
            for (o in vs.vals()) {
                orders.put(o.id, o);
            };
        };


        public func createOrder(o : Types.OrderData) : Result.Result<(), Text> {
            if (orders.get(o.id) != null) {
                return #err("Order dengan ID ini sudah ada.");
            };
            orders.put(o.id, o);
            return #ok(());
        };

        public func readOrder(id : Text) : Result.Result<Types.OrderData, Text> {
            switch (orders.get(id)) {
                case (?order) { #ok(order) };
                case null { #err("Order tidak ditemukan.") };
            };
        };

        public func updateOrder(o : Types.OrderData) : Result.Result<(), Text> {
            if (orders.get(o.id) == null) {
                return #err("Order tidak ditemukan.");
            };
            orders.put(o.id, o);
            return #ok(());
        };

        public func deleteOrder(id : Text) : Result.Result<(), Text> {
            switch (orders.remove(id)) {
                case (?_) { #ok(()) };
                case null { #err("Order tidak ditemukan.") };
            };
        };

        public func listOrders() : [Types.OrderData] {
            Iter.toArray(orders.vals());
        };
    };
};
