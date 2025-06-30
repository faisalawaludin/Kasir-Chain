import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Types "../types/Types";

module {
  public class CategoryService() {
    let categories = HashMap.HashMap<Text, Types.CategoryData>(10, Text.equal, Text.hash);

    public func setCategories(vs : [Types.CategoryData]) : () {
      for (c in vs.vals()) {
        categories.put(c.id, c);
      };
    };

    public func createCategory(c: Types.CategoryData) : Result.Result<(), Text> {
      if (categories.get(c.id) != null) {
        return #err("Kategori sudah ada.");
      };
      categories.put(c.id, c);
      return #ok(());
    };

    public func readCategory(id: Text) : Result.Result<Types.CategoryData, Text> {
      switch (categories.get(id)) {
        case (?cat) { #ok(cat) };
        case null { #err("Kategori tidak ditemukan.") };
      }
    };

    public func updateCategory(c: Types.CategoryData) : Result.Result<(), Text> {
      if (categories.get(c.id) == null) {
        return #err("Kategori tidak ditemukan.");
      };
      categories.put(c.id, c);
      return #ok(());
    };

    public func deleteCategory(id: Text) : Result.Result<(), Text> {
      switch (categories.remove(id)) {
        case (?_) { #ok(()) };
        case null { #err("Kategori tidak ditemukan.") };
      }
    };

    public func listCategories() : [Types.CategoryData] {
      Iter.toArray(categories.vals());
    };
  };
};
