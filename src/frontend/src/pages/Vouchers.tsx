import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Ticket, Copy, Gift, Plus, Trash2, Edit, Search, PercentIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { listVouchers, addVoucher, updateVoucher, deleteVoucher } from "@/services/voucher";
import { mapDataToVoucher, mapVoucherToData } from "@/mappers/voucherMapper"; // pastikan import benar


// Define voucher interface
interface Voucher {
  id: string;
  code: string;
  discount: number;
  expiryDate: string;
  description: string;
  isActive: boolean;
}


const Vouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Form state
  const [formValues, setFormValues] = useState({
    code: "",
    discount: 0,
    expiryDate: "",
    description: "",
  });

  // Load vouchers
  useEffect(() => {
    const fetchData = async () => {
      const data = await listVouchers();
      const mapped = data.map(mapDataToVoucher); 
      setVouchers(mapped);
    };
    fetchData();
  }, []);

  const filteredVouchers = vouchers.filter(voucher =>
    voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voucher.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Voucher code ${code} copied to clipboard!`);
  };

  const handleAdd = () => {
    setFormValues({
      code: "",
      discount: 0,
      expiryDate: "",
      description: ""
    });
    setEditingVoucher(null);
    setIsAddVoucherOpen(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setFormValues({
      code: voucher.code,
      discount: voucher.discount,
      expiryDate: voucher.expiryDate,
      description: voucher.description
    });
    setEditingVoucher(voucher);
    setIsAddVoucherOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteVoucher(id);
    if (success) {
      setVouchers(prev => prev.filter(v => v.id !== id));
      toast.success("Voucher berhasil dihapus");
    } else {
      toast.error("Gagal menghapus voucher");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: name === 'discount' ? parseFloat(value) : value
    });
  };

  const handleSubmit = async () => {
    if (!formValues.code || !formValues.expiryDate || formValues.discount <= 0) {
      toast.error("Data tidak lengkap atau diskon tidak valid");
      return;
    }

    if (editingVoucher) {
      const updatedVoucher = {
        ...editingVoucher,
        ...formValues,
      };

      const success = await updateVoucher(mapVoucherToData(updatedVoucher));
      if (success) {
        setVouchers(prev =>
          prev.map(v => (v.id === updatedVoucher.id ? updatedVoucher : v))
        );
      } else {
        toast.error("Gagal memperbarui voucher");
      }
    } else {
      const newVoucher = {
        id: `v${Date.now()}`,
        ...formValues,
        isActive: true,
      };

      const success = await addVoucher(mapVoucherToData(newVoucher));
      if (success) {
        setVouchers(prev => [...prev, newVoucher]);
      } else {
        toast.error("Gagal menambah voucher");
      }
    }

    setIsAddVoucherOpen(false);
  };



  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4 lg:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Vouchers & Discounts</h1>
          <p className="text-gray-600">Browse and redeem special offers for your purchases</p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search vouchers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          <Button onClick={handleAdd} className="bg-pos-primary hover:bg-pos-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add Voucher
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => (
            <div key={voucher.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-pos-primary/5 p-4 flex items-start justify-between border-b border-gray-100">
                <div className="flex items-center">
                  <div className="bg-pos-primary/20 p-2 rounded-lg mr-3">
                    <Ticket className="h-5 w-5 text-pos-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{voucher.code}</h3>
                    <p className="text-sm text-gray-500">{voucher.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-pos-primary hover:bg-pos-primary/10"
                  onClick={() => copyToClipboard(voucher.code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PercentIcon className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium">{voucher.discount}% off</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Expires: {new Date(voucher.expiryDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className={`px-2 py-1 text-xs rounded-full ${voucher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {voucher.isActive ? 'Active' : 'Inactive'}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      onClick={() => handleEdit(voucher)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(voucher.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVouchers.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <Gift className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-1">No vouchers found</h3>
            <p className="text-gray-500 mb-4">Try a different search or add a new voucher</p>
            <Button onClick={handleAdd} className="bg-pos-primary hover:bg-pos-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Add Voucher
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Voucher Dialog */}
      <Dialog open={isAddVoucherOpen} onOpenChange={setIsAddVoucherOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingVoucher ? 'Edit Voucher' : 'Add New Voucher'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="code" className="text-sm font-medium">
                Voucher Code
              </label>
              <Input
                id="code"
                name="code"
                placeholder="e.g. SUMMER25"
                value={formValues.code}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="discount" className="text-sm font-medium">
                Discount Percentage
              </label>
              <Input
                id="discount"
                name="discount"
                type="number"
                placeholder="e.g. 25"
                value={formValues.discount || ''}
                onChange={handleInputChange}
                min="1"
                max="99"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="expiryDate" className="text-sm font-medium">
                Expiry Date
              </label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formValues.expiryDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                name="description"
                placeholder="e.g. 25% off on summer collection"
                value={formValues.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVoucherOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-pos-primary hover:bg-pos-primary/90">
              {editingVoucher ? 'Update Voucher' : 'Add Voucher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Vouchers;