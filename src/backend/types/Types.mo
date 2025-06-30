import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Time "mo:base/Time";

module {
    // Aliases
    public type ProductMap = HashMap.HashMap<Text, ProductData>;
    public type CategoryMap = HashMap.HashMap<Text, CategoryData>;
    public type VoucherMap = HashMap.HashMap<Text, VoucherData>;
    public type OrderMap = HashMap.HashMap<Text, OrderData>; 

    // Sub-kategori produk
    public type SubCategory = {
        id : Text;
        name : Text;
        additionalPrice : Nat;
    };

    // Produk
    public type ProductData = {
        id : Text;
        name : Text;
        price : Nat;
        image : Text;
        categoryId : Text;
        description : Text;
        status : Text;
        subCategories : [SubCategory];
    };

    // Kategori
    public type CategoryData = {
        id : Text;
        name : Text;
        icon : Text;
    };

    // Voucher
    public type VoucherData = {
        id : Text;
        code : Text;
        discount : Nat;
        expiryDate : Text;
        description : Text;
        isActive : Bool;
    };

    // Sub kategori produk (referensi)
    public type ProductSubCategory = SubCategory;

    // Item di dalam order
    public type CartItem = {
        product : ProductData;
        quantity : Nat;
        selectedSubCategory : ?ProductSubCategory;
        customerNote : ?Text;
        orderId : ?Text;
    };

    // Status order
    public type OrderStatus = {
        #pending;
        #processing;
        #completed;
        #cancelled;
    };

    // Data order
    public type OrderData = {
        id : Text;
        items : [CartItem];
        status : OrderStatus;
        total : Nat;
        subtotal : Nat;
        discount : Nat;
        tax : Nat;
        createdAt : Time.Time;
        completedAt : ?Time.Time;
        paymentMethod : ?Text;
        cryptoToken : ?Text;
    };
};
