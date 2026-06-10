import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Package, 
  Tag, DollarSign,
   Image as ImageIcon,
    Upload, CheckCircle }
 from "lucide-react";
import { apiUrl } from "../../config/api";

function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);

  const [data, setData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(apiUrl("/api/categories"));
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    formData.append("image", imageFile);

    try {
      await axios.post(apiUrl("/api/products"), formData);
      alert("Product added successfully");
      navigate("/admin/products");
    } catch (error) {
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Product</h1>
          <p className="text-slate-500 mt-1">Add a new item to your store inventory.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="flex items-center gap-2 font-bold text-lg mb-6 text-slate-700 underline underline-offset-8 decoration-blue-500/30">
                <Package size={20} className="text-blue-500" /> General Information
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Product Title</label>
                  <input
                    name="name"
                    placeholder="e.g. Midnight Bluetooth Headphones"
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Detailed Description</label>
                  <textarea
                    name="description"
                    placeholder="Tell your customers about this product..."
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl h-44 resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="flex items-center gap-2 font-bold text-lg mb-6 text-slate-700 underline underline-offset-8 decoration-green-500/30">
                <DollarSign size={20} className="text-green-500" /> Inventory & Pricing
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <input
                      name="price"
                      type="number"
                      placeholder="0.00"
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 pl-8 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Stock Level</label>
                  <input
                    name="stock"
                    type="number"
                    placeholder="e.g. 50"
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Media & Meta */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="flex items-center gap-2 font-bold text-lg mb-6 text-slate-700 underline underline-offset-8 decoration-purple-500/30">
                <ImageIcon size={20} className="text-purple-500" /> Product Image
              </h3>

              <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px] bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer">
                {preview ? (
                  <div className="relative w-full">
                    <img src={preview} className="h-48 w-full object-contain rounded-lg" alt="Preview" />
                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                      <p className="text-sm font-bold text-blue-600">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="text-sm font-medium text-slate-500">Click to upload photo</p>
                    <p className="text-xs text-slate-400 mt-1">High resolution recommended</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required
                />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="flex items-center gap-2 font-bold text-lg mb-6 text-slate-700 underline underline-offset-8 decoration-orange-500/30">
                <Tag size={20} className="text-orange-500" /> Category
              </h3>

              <select
                name="category"
                value={data.category}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all mb-8"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl shadow-lg transition-all ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 active:scale-[0.98]"
                    }`}
                >
                  {!loading && <CheckCircle size={18} />}
                  {loading ? "Adding Product..." : "Publish Product"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddProduct;
