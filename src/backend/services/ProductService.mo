import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Types "../types/Types";

module {
    public class ProductService() {

        

        let products = HashMap.HashMap<Text, Types.ProductData>(10, Text.equal, Text.hash);

        public func setProducts(vs : [Types.ProductData]) : () {
            for (p in vs.vals()) {
                products.put(p.id, p);
            };
        };

        
        public func createProduct(p : Types.ProductData) : async Result.Result<(), Text> {
            if (products.get(p.id) != null) {
                return #err("Produk dengan ID ini sudah ada.");
            };
            products.put(p.id, p);
            return #ok(());
        };

        public func readProduct(id: Text) : Result.Result<Types.ProductData, Text> {
        switch (products.get(id)) {
            case (?prod) { #ok(prod) };
            case null { #err("Produk tidak ditemukan.") };
        }
        };

        public func updateProduct(p : Types.ProductData) : async Result.Result<(), Text> {
            if (products.get(p.id) != null) {
                products.put(p.id, p);
                return #ok(());
            } else {
                return #err("Produk tidak ditemukan.");
            };
        };

        public func deleteProduct(id : Text) : async Result.Result<(), Text> {
            switch (products.remove(id)) {
                case (?_) { return #ok(()) };
                case null { return #err("Produk tidak ditemukan.") };
            };
        };

        public func listProducts() : [Types.ProductData] {
            Iter.toArray(products.vals());
        };

    };
};
