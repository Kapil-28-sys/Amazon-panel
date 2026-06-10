import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Package, Tag, DollarSign, Image as ImageIcon, Save, ArrowLeft } from "lucide-react";
import { apiUrl, assetUrl } from "../../config/api";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [data, setData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image: "" // To store the existing image URL
  });

  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    axios.get(apiUrl(`/api/products/${id}`)).then((res) => {
      setData(res.data);
      // Set the initial preview to the existing product image
      if (res.data.image) {
        setPreview(assetUrl(res.data.image));
      }
    });
  }, [id]);

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
    formData.append("name", data.name);
    formData.append("category", data.category);
    formData.append("price", data.price);
    formData.append("stock", data.stock);
    formData.append("description", data.description);
    if (imageFile) formData.append("image", imageFile);

    try {
      await axios.put(apiUrl(`/api/products/${id}`), formData);
      alert("Changes saved successfully!");
      navigate("/admin/products");
    } catch (error) {
      alert("Error updating product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Navigation & Header */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-4 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Products</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Edit Product</h1>
          <p className="text-slate-500">Modify the details for <span className="font-semibold text-blue-600">"{data.name}"</span></p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Product Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-800">
                <Package size={20} className="text-blue-500" /> General Info
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Product Name</label>
                  <input name="name" value={data.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea name="description" value={data.description} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 h-44 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-800">
                <DollarSign size={20} className="text-green-500" /> Inventory & Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price ($)</label>
                  <input name="price" type="number" value={data.price} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Stock Level</label>
                  <input name="stock" type="number" value={data.stock} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Media & Save */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-800">
                <ImageIcon size={20} className="text-purple-500" /> Product Image
              </h3>
              <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px] hover:bg-slate-50 transition-all cursor-pointer">
                {preview ? (
                  <div className="relative w-full">
                    <img src={preview} alt="Current Product" className="w-full h-52 object-cover rounded-xl shadow-sm" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <p className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">Change Photo</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="text-slate-300 mx-auto mb-2" size={32} />
                    <p className="text-sm text-slate-500">No image available</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <p className="text-[10px] text-slate-400 mt-3 text-center uppercase tracking-wider">Leave empty to keep current image</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-800">
                <Tag size={20} className="text-orange-500" /> Classification
              </h3>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <input name="category" value={data.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none mb-6" required />
              
              <div className="space-y-3">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                >
                  <Save size={18} />
                  {loading ? "Updating..." : "Update Product"}
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate(-1)}
                  className="w-full bg-white border border-slate-200 text-slate-500 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
