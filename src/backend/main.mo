import ProductService "services/ProductService";
import CategoryService "services/CategoryService";
import VoucherService "services/VoucherService";
import OrderService "services/OrderService";

import Types "types/Types";
import Result "mo:base/Result";
import Text "mo:base/Text";

import LLM "mo:llm";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";


actor {

    //  instance service
    let productService = ProductService.ProductService();
    let categoryService = CategoryService.CategoryService();
    let voucherService = VoucherService.VoucherService();
    let orderService = OrderService.OrderService();

    stable var stableProducts : [Types.ProductData] = [];
    stable var stableCategories : [Types.CategoryData] = [];
    stable var stableVouchers : [Types.VoucherData] = [];
    stable var stableOrders : [Types.OrderData] = [];

    system func preupgrade() {
        stableProducts := productService.listProducts();
        stableCategories := categoryService.listCategories();
        stableVouchers := voucherService.listVouchers();
        stableOrders := orderService.listOrders();
    };

    system func postupgrade() {
        productService.setProducts(stableProducts);
        categoryService.setCategories(stableCategories);
        voucherService.setVouchers(stableVouchers);
        orderService.setOrders(stableOrders);
    };

    // Produk 
    public shared func addProduct(p : Types.ProductData) : async Result.Result<(), Text> {
        await productService.createProduct(p);
    };

    public query func getProduct(id : Text) : async Result.Result<Types.ProductData, Text> {
        productService.readProduct(id);
    };

    public shared func updateProduct(p : Types.ProductData) : async Result.Result<(), Text> {
        await productService.updateProduct(p);
    };

    public shared func deleteProduct(id : Text) : async Result.Result<(), Text> {
        await productService.deleteProduct(id);
    };

    public query func listProducts() : async [Types.ProductData] {
        return productService.listProducts();
    };

    // Kategori 
    public shared func addCategory(c : Types.CategoryData) : async Result.Result<(), Text> {
        categoryService.createCategory(c);
    };

    public query func getCategory(id : Text) : async Result.Result<Types.CategoryData, Text> {
        categoryService.readCategory(id);
    };

    public shared func updateCategory(c : Types.CategoryData) : async Result.Result<(), Text> {
        categoryService.updateCategory(c);
    };

    public shared func deleteCategory(id : Text) : async Result.Result<(), Text> {
        categoryService.deleteCategory(id);
    };

    public query func listCategories() : async [Types.CategoryData] {
        categoryService.listCategories();
    };

    // Voucher 
    public shared func addVoucher(v : Types.VoucherData) : async Result.Result<(), Text> {
        voucherService.createVoucher(v);
    };

    public query func getVoucher(id : Text) : async Result.Result<Types.VoucherData, Text> {
        voucherService.readVoucher(id);
    };

    public shared func updateVoucher(v : Types.VoucherData) : async Result.Result<(), Text> {
        voucherService.updateVoucher(v);
    };

    public shared func deleteVoucher(id : Text) : async Result.Result<(), Text> {
        voucherService.deleteVoucher(id);
    };

    public query func listVouchers() : async [Types.VoucherData] {
        voucherService.listVouchers();
    };

    // Order 
    public shared func addOrder(o : Types.OrderData) : async Result.Result<(), Text> {
        orderService.createOrder(o);
    };

    public query func getOrder(id : Text) : async Result.Result<Types.OrderData, Text> {
        orderService.readOrder(id);
    };

    public shared func updateOrder(o : Types.OrderData) : async Result.Result<(), Text> {
        orderService.updateOrder(o);
    };

    public shared func deleteOrder(id : Text) : async Result.Result<(), Text> {
        orderService.deleteOrder(id);
    };

    public query func listOrders() : async [Types.OrderData] {
        orderService.listOrders();
    };

    // AI Test
    public shared func listProductsAI() : async Text {
        let products = productService.listProducts();
        let orders = orderService.listOrders();

        let productCount = HashMap.HashMap<Text, Nat>(products.size(), Text.equal, Text.hash);

        for (order in Iter.fromArray(orders)) {
            for (item in Iter.fromArray(order.items)) {
                let id = item.product.id;
                let count = switch (productCount.get(id)) {
                    case (?n) n;
                    case null 0;
                };
                productCount.put(id, count + 1);
            };
        };
        
        let productDescriptions = Array.map<Types.ProductData, Text>(products, func(p) {
            let count = switch (productCount.get(p.id)) {
                case (?n) n;
                case null 0;
            };
            "ID: " # p.id # 
            ", Name: " # p.name # 
            ", Desc: " # p.description # 
            ", Price: " # Nat.toText(p.price) # 
            ", Dipesan: " # Nat.toText(count) # "x"
        });

        // Debug log
        // Debug.print("=== Product Descriptions ===");
        // for (desc in Iter.fromArray(productDescriptions)) {
        //     Debug.print(desc);
        // };
        // Debug.print("=== Akhir Deskripsi ===");


        let promptText = "Berikut ini adalah daftar produk:\n"
                # Text.join("\n", Iter.fromArray(productDescriptions))
                # "\n\nDari daftar di atas, pilih 5 produk yang paling menarik atau populer. Berikan saran anda.";

        let response = await LLM.prompt(#Llama3_1_8B, promptText);

        return response;
    };

};
