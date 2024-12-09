import React, { useEffect, useState } from 'react';
import { productAPI } from '../services/api';
import ChangePriceForm from './ChangePriceForm';

const PriceChangeModal = ({ isOpen, onClose, onUpdatePrices, products }) => {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showPriceChangeForm, setShowPriceChangeForm] = useState(false);

    const handleSelectProduct = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const handleOpenPriceChangeForm = () => {
        setShowPriceChangeForm(true);
    };

    // Функция для закрытия модального окна
    const handleCloseModal = () => {
        setSelectedProducts([]); // Сбрасываем выбранные продукты при закрытии
        setShowPriceChangeForm(false); // Скрываем форму изменения цен
        onClose(); // Вызываем родительский обработчик
    };

    if (!isOpen) return null; // Если модальное окно не открыто, ничего не рендерим

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                <div className="flex justify-end">
                    <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                <h2 className="text-lg font-bold mb-4">Изменить цены товаров</h2>
                <ul className="space-y-2 overflow-y-auto max-h-60">
                    {products.map((product) => (
                        <li key={product.id} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleSelectProduct(product.id)}
                                className="mr-2"
                            />
                            {product.name}
                        </li>
                    ))}
                </ul>
                {selectedProducts.length > 0 && (
                    <button onClick={handleOpenPriceChangeForm} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                        Изменить цены
                    </button>
                )}
                {showPriceChangeForm && (
                    <ChangePriceForm
                        selectedProducts={selectedProducts}
                        onUpdatePrices={onUpdatePrices}
                    />
                )}
            </div>
        </div>
    );
};

export default PriceChangeModal;
