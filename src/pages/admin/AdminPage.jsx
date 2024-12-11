import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI, productAPI } from '../../shared/services/api';
import CategoryModal from '../../features/admin-panel/category/CategoryModal';
import ProductModal from '../../features/admin-panel/product/ProductModal';
import LogoutButton from '../login/ui/LogoutButton';
import PriceChangeModal from '../../shared/ui/PriceChangeModal';

const AdminPage = () => { 
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    name: '',
    cost: '',
    typeCostFirst: '',
    typeCostSecond: '',
    imageUrl: ''
  });
  const [isPriceChangeModalOpen, setPriceChangeModalOpen] = useState(false);
  const [currentCategoryProducts, setCurrentCategoryProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };
  useEffect(() => {
	loadCategories();
}, []);

  
const loadProducts = async () => {
    try {
        const response = await productAPI.getAllProducts(); // Убедитесь, что этот метод возвращает правильные данные
        console.log('Products response:', response); // Логируем ответ для отладки
        if (response && response.products) {
            setProducts(response.products); // Убедитесь, что response.products определен
        } else {
            console.error('Products not found in response:', response);
        }
    } catch (error) {
        console.error('Error loading products:', error); // Логируем ошибку
    }
};
  
  useEffect(() => {
	loadProducts();
}, []);

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory({ ...currentCategory, [name]: value });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      // Проверяем данные перед отправкой
      const categoryData = {
        name: currentCategory.name.trim(),
        cost: currentCategory.cost.trim(),
        typeCostFirst: currentCategory.typeCostFirst.trim(),
        typeCostSecond: currentCategory.typeCostSecond.trim(),
        imageUrl: currentCategory.imageUrl?.trim()
      };
  
      // Проверяем обязательные поля
      if (!categoryData.name || !categoryData.cost || !categoryData.typeCostFirst || !categoryData.typeCostSecond) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }
  
      console.log('Sending category data:', categoryData);
  
      if (currentCategory.id) {
        await categoryAPI.updateCategory(currentCategory.id, categoryData);
      } else {
        await categoryAPI.createCategory(categoryData);
      }
      
      loadCategories();
      setIsCategoryModalOpen(false);
      resetCategoryForm();
    } catch (error) {
      console.error('Error saving category:', error);
      console.error('Error response:', error.response?.data);
      alert('Error saving category: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetCategoryForm = () => {
    setCurrentCategory({
      name: '',
      cost: '',
      typeCostFirst: '',
      typeCostSecond: '',
      imageUrl: ''
    });
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
  if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
    try {
      await categoryAPI.deleteCategory(id);
      loadCategories(); // Перезагрузка списка категорий
    } catch (error) {
      console.error('Error deleting category:', error.response?.data || error);
      alert('Ошибка при удалении категории: ' + (error.response?.data?.message || error.message));
    }
  }
};

  const handleOpenProductModal = async (categoryId) => {
    try {
      const response = await productAPI.getProductsByCategoryId(categoryId);
      setCurrentCategoryProducts(response.data.products);
      setCurrentCategory({...currentCategory, id: categoryId});
      setIsProductModalOpen(true);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error loading products:', error);
      console.error('Error response:', error.response?.data);
      alert('Error loading products: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddProduct = async (product) => {
    try {
      await productAPI.createProduct(currentCategory.id, product);
      // Сразу после создания загружаем обновленный список продуктов
      const response = await productAPI.getProductsByCategoryId(currentCategory.id);
      setCurrentCategoryProducts(response.data.products);
      setIsProductModalOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async (product) => {
    try {
      await productAPI.updateProduct(product.id, product);
      const response = await productAPI.getProductsByCategoryId(currentCategory.id);
      setCurrentCategoryProducts(response.data.products);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
        await productAPI.deleteProduct(id);
        // После успешного удаления обновляем список продуктов
        const response = await productAPI.getProductsByCategoryId(currentCategory.id);
        setCurrentCategoryProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ошибка при удалении товара');
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
};
  
	const handleUpdatePrices = async (selectedProducts, isIncrease, isDecrease, percentage) => {
    try {
        const percentValue = parseFloat(percentage);
        if (isNaN(percentValue) || percentValue <= 0) {
            alert('Пожалуйста, введите корректный процент.');
            return;
        }

        const response = await productAPI.updateProductPrices(selectedProducts, isIncrease, isDecrease, percentValue);
        console.log('Prices updated successfully:', response);
        loadProducts(); // Обновите список продуктов, если это необходимо
        setPriceChangeModalOpen(false);
    } catch (error) {
        console.error('Error updating prices:', error);
        alert('Ошибка при обновлении цен. Пожалуйста, попробуйте еще раз.');
    }
};  


  const handleOpenPriceChangeModal = () => {
	setPriceChangeModalOpen(true);
};

  const handleClosePriceChangeModal = () => {
    setPriceChangeModalOpen(false);
  };

  const handleCloseCategoryModal = () => {
	setIsCategoryModalOpen(false);
	resetCategoryForm();
};

  const handleCloseProductModal = () => {
	setIsProductModalOpen(false);
	setSelectedProduct(null);
	setCurrentCategoryProducts([]);
};

  return (
    <div className="bg-slate-400 mx-auto p-4">
      <div className="flex justify-between">
      <h1 className="text-white font-gilroyBold text-2xl sm:text-3xl font-bold mb-4">Уралплата.рф</h1>
      <LogoutButton />
      </div>
      
      <div className="space-x-4">
      <button 
        onClick={() => setIsCategoryModalOpen(true)} 
        className="bg-slate-800 hover:bg-slate-900 font-gilroyBold text-white font-bold py-2 px-4 rounded-full"
      >
        Создать новую категорию
      </button>

      <button
        onClick={handleOpenPriceChangeModal}
        className="bg-slate-800 hover:bg-slate-900 font-gilroyBold text-white font-bold py-2 px-4 rounded-full"
      >
        Изменить цены товаров
      </button>
      </div>

      <div className="mx-[12px] overflow-y-auto mt-[20px]">
        <ul className="space-y-2">
          {categories.map((category) => (
            <li 
              key={category.id} 
              className="flex flex-col sm:flex-row justify-between items-start text-zinc-950 sm:items-center p-2 bg-slate-600 rounded shadow hover:bg-slate-500"
            >
              <span className="mb-2 sm:mb-0 font-medium text-white">{category.name}</span>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleEditCategory(category)} 
                  className="bg-slate-200 hover:bg-slate-300 text-zinc-950 font-bold py-1 px-2 text-xs sm:text-sm rounded"
                >
                  Изменить
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.id)} 
                  className="bg-slate-200 hover:bg-slate-300 text-zinc-950 font-bold py-1 px-2 text-xs sm:text-sm rounded"
                >
                  Удалить
                </button>
                <button 
                  onClick={() => handleOpenProductModal(category.id)} 
                  className="bg-slate-200 hover:bg-slate-300 text-zinc-950 font-bold py-1 px-2 text-xs sm:text-sm rounded"
                >
                  Товары
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        category={currentCategory}
        onChange={handleCategoryInputChange}
        onSubmit={handleCategorySubmit}
      />
      
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        categoryId={currentCategory.id}
        products={currentCategoryProducts}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onEditProduct={handleEditProduct}
        selectedProduct={selectedProduct}
      />
  
        <PriceChangeModal
         isOpen={isPriceChangeModalOpen}
        onClose={handleClosePriceChangeModal}
        onUpdatePrices={handleUpdatePrices} // Передаем функцию для обновления цен
	products={products}        
/>
    </div>
  );
};

export default AdminPage;
