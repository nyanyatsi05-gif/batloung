import { useState, useEffect } from 'react';
import './App.css';
import Login from './Login.jsx';

const API_URL = 'http://localhost:5000/api';

const loadSavedAuth = () => {
  try {
    const token = localStorage.getItem('bf_token');
    const user = JSON.parse(localStorage.getItem('bf_user') || 'null');
    return token && user ? { token, user } : null;
  } catch {
    return null;
  }
};

function App() {
  const [activePage, setActivePage] = useState('Dashboard');

  // LOGIN / ROLES
  const [auth, setAuth] = useState(loadSavedAuth);
  const isAdmin = auth?.user?.role === 'Admin';

  const handleLogin = (token, user) => {
    localStorage.setItem('bf_token', token);
    localStorage.setItem('bf_user', JSON.stringify(user));
    setActivePage('Dashboard');
    setAuth({ token, user });
  };

  const handleLogout = () => {
    localStorage.removeItem('bf_token');
    localStorage.removeItem('bf_user');
    setAuth(null);
  };

  // Sends the login token with every request; logs out if the session expired
  const authFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${auth?.token}`
      }
    });

    if (response.status === 401) handleLogout();

    return response;
  };

  // GENERAL VIEW DETAILS
  const [viewingRecord, setViewingRecord] = useState(null);

  const openViewDetails = (title, record) => {
    setViewingRecord({ title, record });
  };

  const formatFieldName = (field) => {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase());
  };

  const formatFieldValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // SUPPLIER STATES
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    business_name: '',
    contact_person: '',
    phone: '',
    province: '',
    address: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  // VENDOR STATES
  const [vendors, setVendors] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendorMessage, setVendorMessage] = useState('');
  const [vendorEditingId, setVendorEditingId] = useState(null);

  const emptyVendorForm = {
    vendor_name: '',
    phone_number: '',
    location: '',
    registration_date: new Date().toISOString().slice(0, 10)
  };

  const [vendorForm, setVendorForm] = useState(emptyVendorForm);

  // FRUITS AND STOCK STATES
  const [fruits, setFruits] = useState([]);
  const [stock, setStock] = useState([]);
  const [fruitLoading, setFruitLoading] = useState(false);
  const [fruitMessage, setFruitMessage] = useState('');
  const [fruitEditingId, setFruitEditingId] = useState(null);
  const [stockEditingId, setStockEditingId] = useState(null);

  const emptyFruitForm = {
    fruit_name: '',
    description: '',
    status: 'Available'
  };

  const [fruitForm, setFruitForm] = useState(emptyFruitForm);

  const emptyStockForm = {
    fruit_id: '',
    packaging_size: 'Small',
    available_quantity: ''
  };

  const [stockForm, setStockForm] = useState(emptyStockForm);

  // PURCHASE STATES
  const [purchases, setPurchases] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSaving, setPurchaseSaving] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  const [purchaseForm, setPurchaseForm] = useState({
    supplier_id: '',
    purchase_date: new Date().toISOString().slice(0, 10)
  });

  const [purchaseItems, setPurchaseItems] = useState([
    {
      fruit_id: '',
      packaging_size: 'Small',
      quantity: '',
      unit_cost: ''
    }
  ]);

  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // SALES STATES
  const [sales, setSales] = useState([]);
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleSaving, setSaleSaving] = useState(false);
  const [saleMessage, setSaleMessage] = useState('');

  const [saleForm, setSaleForm] = useState({
    vendor_id: '',
    sale_date: new Date().toISOString().slice(0, 10),
    payment_status: 'UNPAID'
  });

  const [saleItems, setSaleItems] = useState([
    {
      fruit_id: '',
      packaging_size: 'Small',
      quantity: '',
      unit_price: ''
    }
  ]);

  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetails, setSaleDetails] = useState([]);
  const [saleDetailsLoading, setSaleDetailsLoading] = useState(false);

  // PAYMENT STATES
  const [payments, setPayments] = useState([]);
  const [paymentSales, setPaymentSales] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  const [paymentForm, setPaymentForm] = useState({
    sale_id: '',
    payment_amount: '',
    payment_method: 'CASH',
    payment_date: new Date().toISOString().slice(0, 10)
  });

  // REPORT STATES
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState('');

  // MENU ITEMS
  const allMenuItems = [
    { name: 'Dashboard', adminOnly: false },
    { name: 'Suppliers', adminOnly: true },
    { name: 'Fruits & Stock', adminOnly: false },
    { name: 'Vendors', adminOnly: false },
    { name: 'Purchases', adminOnly: true },
    { name: 'Sales', adminOnly: false },
    { name: 'Payments', adminOnly: false },
    { name: 'Reports', adminOnly: true }
  ];

  const menuItems = allMenuItems.filter(item => isAdmin || !item.adminOnly);
  // MAP STATES
const [mapLocations, setMapLocations] = useState({
  suppliers: [],
  vendors: []
});

const [mapMessage, setMapMessage] = useState('');

  // DASHBOARD DATA
  const stats = [
    { title: 'Total Suppliers', value: suppliers.length, icon: 'S', color: 'blue' },
    { title: 'Total Fruits', value: fruits.length, icon: 'F', color: 'orange' },
    { title: 'Registered Vendors', value: vendors.length, icon: 'V', color: 'purple' },
    { title: 'Total Sales', value: sales.length, icon: 'T', color: 'green' }
  ];

  // RESPONSE HELPER
  const getResponseData = async (response) => {
    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        'The server returned an invalid response. Check that your backend is running and the API route is connected.'
      );
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Something went wrong.');
    }

    return data;
  };

  // SUPPLIER FUNCTIONS
  const fetchSuppliers = async () => {
    setLoading(true);

    try {
      const response = await authFetch(`${API_URL}/suppliers`);
      const data = await getResponseData(response);
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const url = editingId
      ? `${API_URL}/suppliers/${editingId}`
      : `${API_URL}/suppliers`;

    try {
      const response = await authFetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await getResponseData(response);
      setMessage(data.message);
      setFormData(emptyForm);
      setEditingId(null);
      await fetchSuppliers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.supplier_id);
    setFormData({
      business_name: supplier.business_name,
      contact_person: supplier.contact_person,
      phone: supplier.phone,
      province: supplier.province,
      address: supplier.address
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const response = await authFetch(`${API_URL}/suppliers/${id}`, {
        method: 'DELETE'
      });
      const data = await getResponseData(response);
      setMessage(data.message);
      await fetchSuppliers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setMessage('');
  };

  // VENDOR FUNCTIONS
  const fetchVendors = async () => {
    setVendorLoading(true);

    try {
      const response = await authFetch(`${API_URL}/vendors`);
      const data = await getResponseData(response);
      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      setVendorMessage(error.message);
    } finally {
      setVendorLoading(false);
    }
  };

  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendorForm({ ...vendorForm, [name]: value });
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setVendorMessage('');

    const url = vendorEditingId
      ? `${API_URL}/vendors/${vendorEditingId}`
      : `${API_URL}/vendors`;

    try {
      const response = await authFetch(url, {
        method: vendorEditingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorForm)
      });

      const data = await getResponseData(response);
      setVendorMessage(data.message);
      setVendorForm(emptyVendorForm);
      setVendorEditingId(null);
      await fetchVendors();
    } catch (error) {
      setVendorMessage(error.message);
    }
  };

  const handleVendorEdit = (vendor) => {
    setVendorEditingId(vendor.vendor_id);
    setVendorForm({
      vendor_name: vendor.vendor_name,
      phone_number: vendor.phone_number,
      location: vendor.location,
      registration_date: String(vendor.registration_date).slice(0, 10)
    });
    setVendorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVendorDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const response = await authFetch(`${API_URL}/vendors/${id}`, {
        method: 'DELETE'
      });
      const data = await getResponseData(response);
      setVendorMessage(data.message);
      await fetchVendors();
    } catch (error) {
      setVendorMessage(error.message);
    }
  };

  // FRUITS AND STOCK FUNCTIONS
  const fetchFruits = async () => {
    try {
      const response = await authFetch(`${API_URL}/fruits`);
      const data = await getResponseData(response);
      setFruits(Array.isArray(data) ? data : []);
    } catch (error) {
      setFruitMessage(error.message);
    }
  };

  const fetchStock = async () => {
    setFruitLoading(true);

    try {
      const response = await authFetch(`${API_URL}/stock`);
      const data = await getResponseData(response);
      setStock(Array.isArray(data) ? data : []);
    } catch (error) {
      setFruitMessage(error.message);
    } finally {
      setFruitLoading(false);
    }
  };

  const handleFruitSubmit = async (e) => {
    e.preventDefault();
    setFruitMessage('');

    const url = fruitEditingId
      ? `${API_URL}/fruits/${fruitEditingId}`
      : `${API_URL}/fruits`;

    try {
      const response = await authFetch(url, {
        method: fruitEditingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fruitForm)
      });

      const data = await getResponseData(response);
      setFruitMessage(data.message);
      setFruitForm(emptyFruitForm);
      setFruitEditingId(null);
      await fetchFruits();
      await fetchStock();
    } catch (error) {
      setFruitMessage(error.message);
    }
  };

  const handleFruitEdit = (fruit) => {
    setFruitEditingId(fruit.fruit_id);
    setFruitForm({
      fruit_name: fruit.fruit_name,
      description: fruit.description || '',
      status: fruit.status
    });
    setFruitMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFruitDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fruit?')) return;

    try {
      const response = await authFetch(`${API_URL}/fruits/${id}`, {
        method: 'DELETE'
      });
      const data = await getResponseData(response);
      setFruitMessage(data.message);
      await fetchFruits();
      await fetchStock();
    } catch (error) {
      setFruitMessage(error.message);
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setFruitMessage('');

    try {
      const response = await authFetch(`${API_URL}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stockForm,
          fruit_id: Number(stockForm.fruit_id),
          available_quantity: Number(stockForm.available_quantity)
        })
      });

      const data = await getResponseData(response);
      setFruitMessage(data.message);
      setStockForm(emptyStockForm);
      await fetchStock();
    } catch (error) {
      setFruitMessage(error.message);
    }
  };

  const handleStockEdit = (item) => {
    setStockEditingId(item.stock_id);
    setStockForm({
      fruit_id: String(item.fruit_id),
      packaging_size: item.packaging_size,
      available_quantity: String(item.available_quantity)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setFruitMessage('');

    try {
      const response = await authFetch(`${API_URL}/stock/${stockEditingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packaging_size: stockForm.packaging_size,
          available_quantity: Number(stockForm.available_quantity)
        })
      });

      const data = await getResponseData(response);
      setFruitMessage(data.message);
      setStockEditingId(null);
      setStockForm(emptyStockForm);
      await fetchStock();
    } catch (error) {
      setFruitMessage(error.message);
    }
  };

  const handleStockDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock record?')) return;

    try {
      const response = await authFetch(`${API_URL}/stock/${id}`, {
        method: 'DELETE'
      });
      const data = await getResponseData(response);
      setFruitMessage(data.message);
      await fetchStock();
    } catch (error) {
      setFruitMessage(error.message);
    }
  };

  // PURCHASE FUNCTIONS
  const fetchPurchases = async () => {
    setPurchaseLoading(true);
    setPurchaseMessage('');

    try {
      const response = await authFetch(`${API_URL}/purchases`);
      const data = await getResponseData(response);
      setPurchases(Array.isArray(data) ? data : []);
    } catch (error) {
      setPurchaseMessage(error.message);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handlePurchaseFormChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm({ ...purchaseForm, [name]: value });
  };

  const handlePurchaseItemChange = (index, field, value) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setPurchaseItems(updatedItems);
  };

  const addPurchaseItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      { fruit_id: '', packaging_size: 'Small', quantity: '', unit_cost: '' }
    ]);
  };

  const removePurchaseItem = (index) => {
    if (purchaseItems.length === 1) {
      setPurchaseMessage('A purchase must have at least one item.');
      return;
    }
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const purchaseTotal = purchaseItems.reduce((total, item) => {
    return total +
      (Number(item.quantity) || 0) *
      (Number(item.unit_cost) || 0);
  }, 0);

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setPurchaseMessage('');

    if (!purchaseForm.supplier_id) {
      setPurchaseMessage('Please select a supplier.');
      return;
    }

    if (!purchaseForm.purchase_date) {
      setPurchaseMessage('Please select a purchase date.');
      return;
    }

    const validItems = purchaseItems.every(item =>
      item.fruit_id &&
      Number.isInteger(Number(item.quantity)) &&
      Number(item.quantity) > 0 &&
      item.unit_cost !== '' &&
      Number(item.unit_cost) >= 0
    );

    if (!validItems) {
      setPurchaseMessage('Please select a fruit and enter a valid quantity and unit cost for every item.');
      return;
    }

    const purchaseData = {
      supplier_id: Number(purchaseForm.supplier_id),
      purchase_date: purchaseForm.purchase_date,
      items: purchaseItems.map(item => ({
        fruit_id: Number(item.fruit_id),
        packaging_size: item.packaging_size,
        quantity: Number(item.quantity),
        unit_cost: Number(item.unit_cost)
      }))
    };

    setPurchaseSaving(true);

    try {
      const response = await authFetch(`${API_URL}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      });

      const data = await getResponseData(response);

      setPurchaseMessage(
        `Purchase #${data.purchase_id} recorded successfully. Total: M${Number(data.total_amount).toFixed(2)}`
      );

      setPurchaseForm({
        supplier_id: '',
        purchase_date: new Date().toISOString().slice(0, 10)
      });

      setPurchaseItems([
        { fruit_id: '', packaging_size: 'Small', quantity: '', unit_cost: '' }
      ]);

      await fetchPurchases();
      await fetchStock();
    } catch (error) {
      setPurchaseMessage(error.message);
    } finally {
      setPurchaseSaving(false);
    }
  };

  const viewPurchaseDetails = async (id) => {
    alert("Purchase button clicked. ID: " + id);
    setDetailsLoading(true);
    setPurchaseMessage('');
    setSelectedPurchase(id);
    setPurchaseDetails([]);

    try {
      const response = await authFetch(`${API_URL}/purchases/${id}/details`);
      const data = await getResponseData(response);
      setPurchaseDetails(Array.isArray(data) ? data : []);
    } catch (error) {
      setPurchaseMessage(error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  // SALES FUNCTIONS
  const fetchSales = async () => {
    setSaleLoading(true);
    setSaleMessage('');

    try {
      const response = await authFetch(`${API_URL}/sales`);
      const data = await getResponseData(response);
      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      setSaleMessage(error.message);
    } finally {
      setSaleLoading(false);
    }
  };

  const handleSaleFormChange = (e) => {
    const { name, value } = e.target;
    setSaleForm({ ...saleForm, [name]: value });
  };

  const handleSaleItemChange = (index, field, value) => {
    const updatedItems = [...saleItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setSaleItems(updatedItems);
  };

  const addSaleItem = () => {
    setSaleItems([
      ...saleItems,
      { fruit_id: '', packaging_size: 'Small', quantity: '', unit_price: '' }
    ]);
  };

  const removeSaleItem = (index) => {
    if (saleItems.length === 1) {
      setSaleMessage('A sale must have at least one item.');
      return;
    }
    setSaleItems(saleItems.filter((_, i) => i !== index));
    setSaleMessage('');
  };

  const saleTotal = saleItems.reduce((total, item) => {
    return total +
      (Number(item.quantity) || 0) *
      (Number(item.unit_price) || 0);
  }, 0);

  const getAvailableStock = (fruitId, packagingSize) => {
    const record = stock.find(item =>
      Number(item.fruit_id) === Number(fruitId) &&
      item.packaging_size === packagingSize
    );

    return record ? Number(record.available_quantity) : 0;
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    setSaleMessage('');

    if (!saleForm.vendor_id) {
      setSaleMessage('Please select a vendor.');
      return;
    }

    if (!saleForm.sale_date) {
      setSaleMessage('Please select a sale date.');
      return;
    }

    const validItems = saleItems.every(item =>
      item.fruit_id &&
      ['Small', 'Medium', 'Large'].includes(item.packaging_size) &&
      Number.isInteger(Number(item.quantity)) &&
      Number(item.quantity) > 0 &&
      item.unit_price !== '' &&
      Number.isFinite(Number(item.unit_price)) &&
      Number(item.unit_price) >= 0
    );

    if (!validItems) {
      setSaleMessage('Please select a fruit and enter a valid quantity and selling price for every item.');
      return;
    }

    for (const item of saleItems) {
      const available = getAvailableStock(item.fruit_id, item.packaging_size);

      if (Number(item.quantity) > available) {
        const fruit = fruits.find(f =>
          Number(f.fruit_id) === Number(item.fruit_id)
        );

        setSaleMessage(
          `Insufficient stock for ${fruit?.fruit_name || 'selected fruit'} (${item.packaging_size}). Available quantity: ${available}.`
        );
        return;
      }
    }

    const saleData = {
      vendor_id: Number(saleForm.vendor_id),
      sale_date: saleForm.sale_date,
      payment_status: 'UNPAID',
      items: saleItems.map(item => ({
        fruit_id: Number(item.fruit_id),
        packaging_size: item.packaging_size,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price)
      }))
    };

    setSaleSaving(true);

    try {
      const response = await authFetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      const data = await getResponseData(response);

      setSaleMessage(
        `Sale #${data.sale_id} recorded successfully! Total: M${Number(data.total_amount).toFixed(2)}. Stock has been updated.`
      );

      resetSaleForm();
      await fetchSales();
      await fetchStock();
    } catch (error) {
      setSaleMessage(error.message);
    } finally {
      setSaleSaving(false);
    }
  };

  const viewSaleDetails = async (id) => {
    setSaleDetailsLoading(true);
    setSaleMessage('');
    setSelectedSale(id);
    setSaleDetails([]);

    try {
      const response = await authFetch(`${API_URL}/sales/${id}/details`);
      const data = await getResponseData(response);
      setSaleDetails(Array.isArray(data) ? data : []);
    } catch (error) {
      setSaleMessage(error.message);
    } finally {
      setSaleDetailsLoading(false);
    }
  };

  const resetSaleForm = () => {
    setSaleForm({
      vendor_id: '',
      sale_date: new Date().toISOString().slice(0, 10),
      payment_status: 'UNPAID'
    });

    setSaleItems([
      { fruit_id: '', packaging_size: 'Small', quantity: '', unit_price: '' }
    ]);

    setSaleMessage('');
  };

  // PAYMENT FUNCTIONS
  const fetchPayments = async () => {
    setPaymentLoading(true);
    setPaymentMessage('');

    try {
      const response = await authFetch(`${API_URL}/payments`);
      const data = await getResponseData(response);
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      setPaymentMessage(error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchPaymentSales = async () => {
    try {
      const response = await authFetch(`${API_URL}/payments/sales`);
      const data = await getResponseData(response);
      setPaymentSales(Array.isArray(data) ? data : []);
    } catch (error) {
      setPaymentMessage(error.message);
    }
  };

  const selectedPaymentSale = paymentSales.find(
    sale => Number(sale.sale_id) === Number(paymentForm.sale_id)
  );

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm({ ...paymentForm, [name]: value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentMessage('');

    if (!paymentForm.sale_id) {
      setPaymentMessage('Please select a sale.');
      return;
    }

    if (!paymentForm.payment_amount || Number(paymentForm.payment_amount) <= 0) {
      setPaymentMessage('Please enter a valid payment amount.');
      return;
    }

    if (!paymentForm.payment_date) {
      setPaymentMessage('Please select a payment date.');
      return;
    }

    if (
      selectedPaymentSale &&
      Number(paymentForm.payment_amount) >
      Number(selectedPaymentSale.outstanding_balance)
    ) {
      setPaymentMessage(
        `The payment cannot be more than the outstanding balance of M${Number(selectedPaymentSale.outstanding_balance).toFixed(2)}.`
      );
      return;
    }

    setPaymentSaving(true);

    try {
      const response = await authFetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_id: Number(paymentForm.sale_id),
          payment_amount: Number(paymentForm.payment_amount),
          payment_method: paymentForm.payment_method,
          payment_date: paymentForm.payment_date
        })
      });

      const data = await getResponseData(response);
      setPaymentMessage(data.message || 'Payment recorded successfully.');

      setPaymentForm({
        sale_id: '',
        payment_amount: '',
        payment_method: 'CASH',
        payment_date: new Date().toISOString().slice(0, 10)
      });

      await fetchPayments();
      await fetchPaymentSales();
      await fetchSales();
    } catch (error) {
      setPaymentMessage(error.message);
    } finally {
      setPaymentSaving(false);
    }
  };

  // REPORT FUNCTIONS
  const fetchReportData = async () => {
    setReportLoading(true);
    setReportMessage('');

    try {
      const [salesResponse, purchasesResponse, paymentsResponse, stockResponse] =
        await Promise.all([
          authFetch(`${API_URL}/sales`),
          authFetch(`${API_URL}/purchases`),
          authFetch(`${API_URL}/payments`),
          authFetch(`${API_URL}/stock`)
        ]);

      const [salesData, purchasesData, paymentsData, stockData] =
        await Promise.all([
          getResponseData(salesResponse),
          getResponseData(purchasesResponse),
          getResponseData(paymentsResponse),
          getResponseData(stockResponse)
        ]);

      setSales(Array.isArray(salesData) ? salesData : []);
      setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setStock(Array.isArray(stockData) ? stockData : []);
    } catch (error) {
      setReportMessage(error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const clearReportDates = () => {
    setReportStartDate('');
    setReportEndDate('');
  };
// LOAD DISTRIBUTION LOCATIONS
const fetchMapLocations = async () => {
  try {
    setMapMessage('');

    const response = await authFetch(`${API_URL}/map/locations`);
    const data = await getResponseData(response);

    setMapLocations({
      suppliers: Array.isArray(data.suppliers) ? data.suppliers : [],
      vendors: Array.isArray(data.vendors) ? data.vendors : []
    });
  } catch (error) {
    setMapMessage(error.message);
  }
};
  // LOAD DATA WHEN PAGES OPEN
  useEffect(() => {
    if (!auth) return;

    if (activePage === 'Suppliers') fetchSuppliers();
    if (activePage === 'Vendors') fetchVendors();

    if (activePage === 'Dashboard' || activePage === 'Fruits & Stock') {
      fetchFruits();
      fetchStock();
    }

    if (activePage === 'Purchases') {
      fetchPurchases();
      fetchSuppliers();
      fetchFruits();
    }

    if (activePage === 'Sales') {
      fetchSales();
      fetchVendors();
      fetchFruits();
      fetchStock();
    }

    if (activePage === 'Payments') {
      fetchPayments();
      fetchPaymentSales();
    }

    if (activePage === 'Dashboard') {
      fetchSales();
      fetchVendors();
    }

    if (activePage === 'Reports') {
      fetchReportData();
    }
  }, [activePage, auth]);

  // REPORT CALCULATIONS
  const isWithinDateRange = (date) => {
    const recordDate = String(date || '').slice(0, 10);

    if (!recordDate) return false;
    if (reportStartDate && recordDate < reportStartDate) return false;
    if (reportEndDate && recordDate > reportEndDate) return false;

    return true;
  };

  const filteredSales = sales.filter(sale =>
    isWithinDateRange(sale.sale_date)
  );

  const filteredPurchases = purchases.filter(purchase =>
    isWithinDateRange(purchase.purchase_date)
  );

  const filteredPayments = payments.filter(payment =>
    isWithinDateRange(payment.payment_date)
  );

  const totalSales = filteredSales.reduce(
    (total, sale) => total + Number(sale.total_amount || 0), 0
  );

  const totalPurchases = filteredPurchases.reduce(
    (total, purchase) => total + Number(purchase.total_amount || 0), 0
  );

  const totalPayments = filteredPayments.reduce(
    (total, payment) => total + Number(payment.payment_amount || 0), 0
  );

  const totalStock = stock.reduce(
    (total, item) => total + Number(item.available_quantity || 0), 0
  );

  const lowStock = stock.filter(
    item => Number(item.available_quantity) <= 10
  );

  // SHOW LOGIN SCREEN UNTIL SIGNED IN
  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  const displayName = isAdmin ? 'Administrator' : 'Staff Member';
  const initials = isAdmin ? 'AD' : 'ST';

  // MAIN RETURN
  return (
    <div className="app-container">

      {/* TOP MENU */}
      <header className="top-nav">
        <div className="top-nav-inner">
          <div className="top-brand">
            <span className="top-brand-logo">BF</span>
            <h2>BF Distribution System</h2>
          </div>

          <nav className="top-menu">
            {menuItems.map(item => (
              <button
                key={item.name}
                className={`menu-item ${activePage === item.name ? 'active' : ''}`}
                onClick={() => setActivePage(item.name)}
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="top-user">
            <span className="profile-icon">{initials}</span>
            <div className="top-user-text">
              <strong>{auth.user.username}</strong>
              <small>{auth.user.role}</small>
            </div>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* PAGE TITLE */}
        <div className="page-title">
          <h2>{activePage}</h2>
          <p>Welcome to BF Distribution System</p>
        </div>

        {/* DASHBOARD */}
        {activePage === 'Dashboard' && (
          <>
            <section className="welcome-banner">
              <div>
                <h1>Welcome Back, {displayName}!</h1>
                <p>
                  Manage your fruits, suppliers, vendors and daily
                  distribution activities from one place.
                </p>
              </div>
              <span className="welcome-icon">BF</span>
            </section>

            <section className="stats-grid">
              {stats.map(stat => (
                <div className="stat-card" key={stat.title}>
                  <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
                  <div>
                    <p>{stat.title}</p>
                    <h2>{stat.value}</h2>
                  </div>
                </div>
              ))}
            </section>

            <section className="distribution-map-card">
              <div className="section-heading">
                <div>
                  <h2>Distribution Locations Map</h2>
                  <p>Supplier regions in South Africa and vendor distribution around Lesotho</p>
                </div>
                <span className="map-count">
                  {mapLocations.suppliers.length} suppliers · {mapLocations.vendors.length} vendors
                </span>
              </div>

              <div className="distribution-map-frame">
                <iframe
                  title="Batloung Farm distribution area map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=25.5%2C-31.5%2C33.5%2C-22.0&layer=mapnik"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="map-attribution">
                Map area: Lesotho and surrounding South African provinces.
                <a href="https://www.openstreetmap.org/#map=6/-27.2/29.5" target="_blank" rel="noreferrer"> Open larger map</a>
              </p>

              {mapMessage && <p className="map-message">{mapMessage}. Check that the backend and MySQL are running.</p>}

              <div className="map-location-columns">
                <div>
                  <h3>Supplier locations</h3>
                  {mapLocations.suppliers.length === 0 ? (
                    <p>No supplier addresses have been registered yet.</p>
                  ) : (
                    <ul>
                      {mapLocations.suppliers.map(item => (
                        <li key={`supplier-${item.id}`}>
                          <strong>{item.name}</strong>
                          <span>{[item.province, item.location].filter(Boolean).join(' · ')}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3>Vendor locations</h3>
                  {mapLocations.vendors.length === 0 ? (
                    <p>No vendor locations have been registered yet.</p>
                  ) : (
                    <ul>
                      {mapLocations.vendors.map(item => (
                        <li key={`vendor-${item.id}`}>
                          <strong>{item.name}</strong>
                          <span>{item.location || 'Location not provided'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>

            <section className="section-heading">
              <div>
                <h2>Current Stock Overview</h2>
                <p>Available fruit boxes by packaging size</p>
              </div>

              <button className="view-button" onClick={() => setActivePage('Fruits & Stock')}>
                View All Stock
              </button>
            </section>

            <section className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Fruit Name</th>
                    <th>Small Boxes</th>
                    <th>Medium Boxes</th>
                    <th>Large Boxes</th>
                    <th>Total Boxes</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {fruits.map(fruit => {
                    const fruitStock = stock.filter(
                      item => Number(item.fruit_id) === Number(fruit.fruit_id)
                    );

                    const small = fruitStock
                      .filter(item => item.packaging_size === 'Small')
                      .reduce((total, item) => total + Number(item.available_quantity), 0);

                    const medium = fruitStock
                      .filter(item => item.packaging_size === 'Medium')
                      .reduce((total, item) => total + Number(item.available_quantity), 0);

                    const large = fruitStock
                      .filter(item => item.packaging_size === 'Large')
                      .reduce((total, item) => total + Number(item.available_quantity), 0);

                    return (
                      <tr key={fruit.fruit_id}>
                        <td><strong>{fruit.fruit_name}</strong></td>
                        <td>{small}</td>
                        <td>{medium}</td>
                        <td>{large}</td>
                        <td><strong>{small + medium + large}</strong></td>
                        <td>
                          <button
                            className="view-button"
                            onClick={() => openViewDetails('Stock Overview: ' + fruit.fruit_name, {
                              fruit_name: fruit.fruit_name,
                              status: fruit.status,
                              small_boxes: small,
                              medium_boxes: medium,
                              large_boxes: large,
                              total_boxes: small + medium + large
                            })}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {fruits.length === 0 && (
                    <tr><td colSpan="6">No fruit records available.</td></tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="bottom-grid">
              <div className="info-card">
                <h3>Quick Actions</h3>
                <p>Manage your daily activities.</p>
                {isAdmin && <button onClick={() => setActivePage('Suppliers')}>+ Add Supplier</button>}
                <button onClick={() => setActivePage('Vendors')}>+ Register Vendor</button>
                <button onClick={() => setActivePage('Fruits & Stock')}>{isAdmin ? '+ Manage Fruits & Stock' : 'View Fruits & Stock'}</button>
                {isAdmin && <button onClick={() => setActivePage('Purchases')}>+ Record Purchase</button>}
                <button onClick={() => setActivePage('Sales')}>+ Record Sale</button>
                <button onClick={() => setActivePage('Payments')}>+ Record Payment</button>
              </div>

              <div className="info-card">
                <h3>System Information</h3>
                <p>Business: BF Distribution System</p>
                <p>Location: Maseru, Lesotho</p>
                <p>Products: {fruits.length} Fruit Types</p>
                <p>Packaging: Small, Medium, Large</p>
              </div>
            </section>
          </>
        )}

        {/* SUPPLIER MANAGEMENT */}
        {activePage === 'Suppliers' && (
          <section className="supplier-page">
            <div className="section-heading">
              <div>
                <h2>Supplier Management</h2>
                <p>Register and manage your fruit suppliers.</p>
              </div>

              <button
                className="view-button"
                onClick={() => {
                  setEditingId(null);
                  setFormData(emptyForm);
                  setMessage('');
                }}
              >
                + New Supplier
              </button>
            </div>

            {message && <div className="supplier-message">{message}</div>}

            <div className="supplier-form-card">
              <h3>{editingId ? 'Update Supplier' : 'Add New Supplier'}</h3>

              <form onSubmit={handleSubmit} className="supplier-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Business Name</label>
                    <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} placeholder="Enter business name" required />
                  </div>

                  <div className="form-group">
                    <label>Contact Person</label>
                    <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} placeholder="Enter contact person" required />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" required />
                  </div>

                  <div className="form-group">
                    <label>Province</label>
                    <select name="province" value={formData.province} onChange={handleChange} required>
                      <option value="">Select province</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="Free State">Free State</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Western Cape">Western Cape</option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="North West">North West</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Business Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter full business address" required />
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="save-button">
                    {editingId ? 'Update Supplier' : 'Save Supplier'}
                  </button>

                  {editingId && (
                    <button type="button" className="cancel-button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="supplier-list-card">
              <div className="section-heading">
                <div>
                  <h2>Registered Suppliers</h2>
                  <p>Total suppliers: {suppliers.length}</p>
                </div>
              </div>

              {loading ? (
                <p>Loading suppliers...</p>
              ) : suppliers.length === 0 ? (
                <p>No suppliers registered yet.</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th><th>Business Name</th><th>Contact Person</th>
                        <th>Phone</th><th>Province</th><th>Address</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map(supplier => (
                        <tr key={supplier.supplier_id}>
                          <td>{supplier.supplier_id}</td>
                          <td><strong>{supplier.business_name}</strong></td>
                          <td>{supplier.contact_person}</td>
                          <td>{supplier.phone}</td>
                          <td>{supplier.province}</td>
                          <td>{supplier.address}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="view-button" onClick={() => openViewDetails('Supplier Details', supplier)}>View</button>
                              <button className="edit-button" onClick={() => handleEdit(supplier)}>Edit</button>
                              <button className="delete-button" onClick={() => handleDelete(supplier.supplier_id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* VENDOR MANAGEMENT */}
        {activePage === 'Vendors' && (
          <section className="supplier-page">
            <div className="section-heading">
              <div>
                <h2>Vendor Management</h2>
                <p>Register and manage your fruit vendors.</p>
              </div>

              <button
                className="view-button"
                onClick={() => {
                  setVendorEditingId(null);
                  setVendorForm(emptyVendorForm);
                  setVendorMessage('');
                }}
              >
                + New Vendor
              </button>
            </div>

            {vendorMessage && <div className="supplier-message">{vendorMessage}</div>}

            <div className="supplier-form-card">
              <h3>{vendorEditingId ? 'Update Vendor' : 'Register New Vendor'}</h3>

              <form onSubmit={handleVendorSubmit} className="supplier-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Vendor Name</label>
                    <input type="text" name="vendor_name" value={vendorForm.vendor_name} onChange={handleVendorChange} placeholder="Enter vendor name" required />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone_number" value={vendorForm.phone_number} onChange={handleVendorChange} placeholder="Enter phone number" required />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input type="text" name="location" value={vendorForm.location} onChange={handleVendorChange} placeholder="Enter vendor location" required />
                  </div>

                  <div className="form-group">
                    <label>Registration Date</label>
                    <input type="date" name="registration_date" value={vendorForm.registration_date} onChange={handleVendorChange} required />
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="save-button">
                    {vendorEditingId ? 'Update Vendor' : 'Save Vendor'}
                  </button>

                  {vendorEditingId && (
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        setVendorEditingId(null);
                        setVendorForm(emptyVendorForm);
                        setVendorMessage('');
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="supplier-list-card">
              <div className="section-heading">
                <div>
                  <h2>Registered Vendors</h2>
                  <p>Total vendors: {vendors.length}</p>
                </div>
              </div>

              {vendorLoading ? (
                <p>Loading vendors...</p>
              ) : vendors.length === 0 ? (
                <p>No vendors registered yet.</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th><th>Vendor Name</th><th>Phone Number</th>
                        <th>Location</th><th>Registration Date</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map(vendor => (
                        <tr key={vendor.vendor_id}>
                          <td>{vendor.vendor_id}</td>
                          <td><strong>{vendor.vendor_name}</strong></td>
                          <td>{vendor.phone_number}</td>
                          <td>{vendor.location}</td>
                          <td>{String(vendor.registration_date).slice(0, 10)}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="view-button" onClick={() => openViewDetails('Vendor Details', vendor)}>View</button>
                              <button className="edit-button" onClick={() => handleVendorEdit(vendor)}>Edit</button>
                              {isAdmin && <button className="delete-button" onClick={() => handleVendorDelete(vendor.vendor_id)}>Delete</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* FRUITS AND STOCK MANAGEMENT */}
        {activePage === 'Fruits & Stock' && (
          <section className="supplier-page">
            <div className="section-heading">
              <div>
                <h2>Fruits & Stock Management</h2>
                <p>Manage registered fruits and monitor available stock.</p>
              </div>

              <button
                className="view-button"
                onClick={() => {
                  setFruitEditingId(null);
                  setFruitForm(emptyFruitForm);
                  setFruitMessage('');
                }}
              >
                + New Fruit
              </button>
            </div>

            {fruitMessage && <div className="supplier-message">{fruitMessage}</div>}

            {isAdmin && (
            <div className="supplier-form-card">
              <h3>{fruitEditingId ? 'Update Fruit' : 'Add New Fruit'}</h3>

              <form onSubmit={handleFruitSubmit} className="supplier-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Fruit Name</label>
                    <select value={fruitForm.fruit_name} onChange={e => setFruitForm({ ...fruitForm, fruit_name: e.target.value })} required>
                      <option value="">Select fruit</option>
                      <option value="Apples">Apples</option>
                      <option value="Bananas">Bananas</option>
                      <option value="Oranges">Oranges</option>
                      <option value="Mangoes">Mangoes</option>
                      <option value="Grapes">Grapes</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select value={fruitForm.status} onChange={e => setFruitForm({ ...fruitForm, status: e.target.value })}>
                      <option value="Available">Available</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <input type="text" value={fruitForm.description} onChange={e => setFruitForm({ ...fruitForm, description: e.target.value })} placeholder="Enter fruit description" />
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="save-button">
                    {fruitEditingId ? 'Update Fruit' : 'Save Fruit'}
                  </button>

                  {fruitEditingId && (
                    <button type="button" className="cancel-button" onClick={() => {
                      setFruitEditingId(null);
                      setFruitForm(emptyFruitForm);
                      setFruitMessage('');
                    }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            )}

            <div className="supplier-list-card">
              <div className="section-heading">
                <div><h2>Registered Fruits</h2><p>Total fruits: {fruits.length}</p></div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Fruit Name</th><th>Description</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {fruits.map(fruit => (
                      <tr key={fruit.fruit_id}>
                        <td>{fruit.fruit_id}</td>
                        <td><strong>{fruit.fruit_name}</strong></td>
                        <td>{fruit.description || 'No description'}</td>
                        <td>{fruit.status}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="view-button" onClick={() => openViewDetails('Fruit Details', fruit)}>View</button>
                            {isAdmin && <button className="edit-button" onClick={() => handleFruitEdit(fruit)}>Edit</button>}
                            {isAdmin && <button className="delete-button" onClick={() => handleFruitDelete(fruit.fruit_id)}>Delete</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {fruits.length === 0 && <tr><td colSpan="5">No fruits registered yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {isAdmin && (
            <div className="supplier-form-card">
              <h3>{stockEditingId ? 'Update Stock' : 'Add Stock'}</h3>

              <form onSubmit={stockEditingId ? handleStockUpdate : handleStockSubmit} className="supplier-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Fruit</label>
                    <select value={stockForm.fruit_id} onChange={e => setStockForm({ ...stockForm, fruit_id: e.target.value })} required disabled={Boolean(stockEditingId)}>
                      <option value="">Select fruit</option>
                      {fruits.map(fruit => <option key={fruit.fruit_id} value={fruit.fruit_id}>{fruit.fruit_name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Packaging Size</label>
                    <select value={stockForm.packaging_size} onChange={e => setStockForm({ ...stockForm, packaging_size: e.target.value })} required>
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Available Quantity</label>
                    <input type="number" min="0" value={stockForm.available_quantity} onChange={e => setStockForm({ ...stockForm, available_quantity: e.target.value })} placeholder="Enter quantity" required />
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="save-button">{stockEditingId ? 'Update Stock' : 'Save Stock'}</button>

                  {stockEditingId && (
                    <button type="button" className="cancel-button" onClick={() => {
                      setStockEditingId(null);
                      setStockForm(emptyStockForm);
                      setFruitMessage('');
                    }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            )}

            <div className="supplier-list-card">
              <div className="section-heading">
                <div><h2>Available Stock</h2><p>Stock quantities retrieved directly from MySQL.</p></div>
              </div>

              {fruitLoading ? <p>Loading stock...</p> : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Stock ID</th><th>Fruit Name</th><th>Packaging Size</th><th>Available Quantity</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {stock.map(item => (
                        <tr key={item.stock_id}>
                          <td>{item.stock_id}</td>
                          <td><strong>{item.fruit_name}</strong></td>
                          <td>{item.packaging_size}</td>
                          <td>{item.available_quantity}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="view-button" onClick={() => openViewDetails('Stock Details', item)}>View</button>
                              {isAdmin && <button className="edit-button" onClick={() => handleStockEdit(item)}>Edit</button>}
                              {isAdmin && <button className="delete-button" onClick={() => handleStockDelete(item.stock_id)}>Delete</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {stock.length === 0 && <tr><td colSpan="5">No stock records available.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* PURCHASE MANAGEMENT */}
        {activePage === 'Purchases' && (
          <section className="supplier-page">
            <div className="section-heading">
              <div><h2>Purchase Management</h2><p>Record and manage fruit purchases from suppliers.</p></div>

              <button className="view-button" onClick={() => {
                setPurchaseForm({
                  supplier_id: '',
                  purchase_date: new Date().toISOString().slice(0, 10)
                });
                setPurchaseItems([{ fruit_id: '', packaging_size: 'Small', quantity: '', unit_cost: '' }]);
                setPurchaseMessage('');
              }}>
                + New Purchase
              </button>
            </div>

            {purchaseMessage && <div className="supplier-message">{purchaseMessage}</div>}

            <div className="supplier-form-card">
              <h3>Record New Purchase</h3>

              <form onSubmit={handlePurchaseSubmit} className="supplier-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Supplier</label>
                    <select name="supplier_id" value={purchaseForm.supplier_id} onChange={handlePurchaseFormChange} required>
                      <option value="">Choose supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.supplier_id} value={supplier.supplier_id}>{supplier.business_name}</option>
                      ))}
                    </select>
                    {suppliers.length === 0 && <small>Register a supplier first.</small>}
                  </div>

                  <div className="form-group">
                    <label>Purchase Date</label>
                    <input type="date" name="purchase_date" value={purchaseForm.purchase_date} onChange={handlePurchaseFormChange} required />
                  </div>
                </div>

                <h3>Purchase Items</h3>

                {purchaseItems.map((item, index) => (
                  <div className="purchase-item-card" key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '18px', marginBottom: '15px' }}>
                    <div className="section-heading">
                      <h4>Item {index + 1}</h4>
                      {purchaseItems.length > 1 && (
                        <button type="button" className="delete-button" onClick={() => removePurchaseItem(index)}>Remove Item</button>
                      )}
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Fruit</label>
                        <select value={item.fruit_id} onChange={e => handlePurchaseItemChange(index, 'fruit_id', e.target.value)} required>
                          <option value="">Select fruit</option>
                          {fruits.map(fruit => <option key={fruit.fruit_id} value={fruit.fruit_id}>{fruit.fruit_name}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Packaging Size</label>
                        <select value={item.packaging_size} onChange={e => handlePurchaseItemChange(index, 'packaging_size', e.target.value)} required>
                          <option value="Small">Small</option>
                          <option value="Medium">Medium</option>
                          <option value="Large">Large</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Quantity</label>
                        <input type="number" min="1" step="1" placeholder="Enter quantity" value={item.quantity} onChange={e => handlePurchaseItemChange(index, 'quantity', e.target.value)} required />
                      </div>

                      <div className="form-group">
                        <label>Unit Cost (M)</label>
                        <input type="number" min="0" step="0.01" placeholder="Enter unit cost" value={item.unit_cost} onChange={e => handlePurchaseItemChange(index, 'unit_cost', e.target.value)} required />
                      </div>
                    </div>

                    <p><strong>Item Subtotal: M{((Number(item.quantity) || 0) * (Number(item.unit_cost) || 0)).toFixed(2)}</strong></p>
                  </div>
                ))}

                <button type="button" className="view-button" onClick={addPurchaseItem}>+ Add Another Item</button>

                <div style={{ marginTop: '20px', padding: '15px', background: '#f5f7f8', borderRadius: '8px' }}>
                  <h2>Purchase Total: M{purchaseTotal.toFixed(2)}</h2>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="save-button" disabled={purchaseSaving || suppliers.length === 0 || fruits.length === 0}>
                    {purchaseSaving ? 'Saving Purchase...' : 'Save Purchase'}
                  </button>
                </div>
              </form>
            </div>

            <div className="supplier-list-card">
              <div className="section-heading">
                <div><h2>Purchase Records</h2><p>Total purchases: {purchases.length}</p></div>
                <button className="view-button" onClick={fetchPurchases} disabled={purchaseLoading}>Refresh Records</button>
              </div>

              {purchaseLoading ? <p>Loading purchases...</p> : purchases.length === 0 ? <p>No purchases recorded yet.</p> : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Purchase ID</th><th>Supplier</th><th>Purchase Date</th><th>Total Amount</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {purchases.map(purchase => (
                        <tr key={purchase.purchase_id}>
                          <td>{purchase.purchase_id}</td>
                          <td><strong>{purchase.business_name}</strong></td>
                          <td>{String(purchase.purchase_date).slice(0, 10)}</td>
                          <td>M{Number(purchase.total_amount).toFixed(2)}</td>
                          <td><button className="edit-button" onClick={() => viewPurchaseDetails(purchase.purchase_id)}>View Details</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {selectedPurchase !== null && (
              <div className="supplier-list-card">
                <div className="section-heading">
                  <div><h2>Purchase #{selectedPurchase} Details</h2><p>Items included in this purchase.</p></div>
                  <button className="cancel-button" onClick={() => {
                    setSelectedPurchase(null);
                    setPurchaseDetails([]);
                  }}>Close Details</button>
                </div>

                {detailsLoading ? <p>Loading purchase details...</p> : purchaseDetails.length === 0 ? <p>No purchase details found.</p> : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr><th>Fruit</th><th>Packaging Size</th><th>Quantity</th><th>Unit Cost</th><th>Subtotal</th></tr>
                      </thead>
                      <tbody>
                        {purchaseDetails.map(detail => (
                          <tr key={detail.purchase_detail_id}>
                            <td>{detail.fruit_name}</td>
                            <td>{detail.packaging_size}</td>
                            <td>{detail.quantity}</td>
                            <td>M{Number(detail.unit_cost).toFixed(2)}</td>
                            <td>M{Number(detail.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* SALES MANAGEMENT */}
        {activePage === 'Sales' && (
          <section className="supplier-page">
            <div className="section-heading">
              <div><h2>Sales Management</h2><p>Record fruit sales and manage vendor transactions.</p></div>
              <button className="view-button" onClick={resetSaleForm}>+ New Sale</button>
            </div>

            {saleMessage && <div className="supplier-message">{saleMessage}</div>}

            <div className="supplier-form-card">
              <h3>Record New Sale</h3>

              <form onSubmit={handleSaleSubmit} className="supplier-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Vendor</label>
                    <select name="vendor_id" value={saleForm.vendor_id} onChange={handleSaleFormChange} required>
                      <option value="">Choose vendor</option>
                      {vendors.map(vendor => <option key={vendor.vendor_id} value={vendor.vendor_id}>{vendor.vendor_name}</option>)}
                    </select>
                    {vendors.length === 0 && <small>Register a vendor first.</small>}
                  </div>

                  <div className="form-group">
                    <label>Sale Date</label>
                    <input type="date" name="sale_date" value={saleForm.sale_date} onChange={handleSaleFormChange} required />
                  </div>

                  <div className="form-group">
                    <label>Payment Status</label>
                    <input type="text" value="UNPAID" readOnly />
                    <small>Record payments separately in the Payments section.</small>
                  </div>
                </div>

                <h3>Sale Items</h3>

                {saleItems.map((item, index) => {
                  const available = item.fruit_id
                    ? getAvailableStock(item.fruit_id, item.packaging_size)
                    : 0;

                  return (
                    <div className="purchase-item-card" key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '18px', marginBottom: '15px' }}>
                      <div className="section-heading">
                        <h4>Sale Item {index + 1}</h4>
                        {saleItems.length > 1 && (
                          <button type="button" className="delete-button" onClick={() => removeSaleItem(index)}>Remove Item</button>
                        )}
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label>Select Fruit</label>
                          <select value={item.fruit_id} onChange={e => handleSaleItemChange(index, 'fruit_id', e.target.value)} required>
                            <option value="">Choose fruit</option>
                            {fruits.filter(fruit => fruit.status === 'Available').map(fruit => (
                              <option key={fruit.fruit_id} value={fruit.fruit_id}>{fruit.fruit_name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Packaging Size</label>
                          <select value={item.packaging_size} onChange={e => handleSaleItemChange(index, 'packaging_size', e.target.value)} required>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Available Stock</label>
                          <input type="number" value={available} readOnly />
                        </div>

                        <div className="form-group">
                          <label>Quantity to Sell</label>
                          <input type="number" min="1" max={available} step="1" placeholder="Enter quantity" value={item.quantity} onChange={e => handleSaleItemChange(index, 'quantity', e.target.value)} required />
                        </div>

                        <div className="form-group">
                          <label>Unit Selling Price (M)</label>
                          <input type="number" min="0" step="0.01" placeholder="Enter selling price" value={item.unit_price} onChange={e => handleSaleItemChange(index, 'unit_price', e.target.value)} required />
                        </div>
                      </div>

                      <p><strong>Item Subtotal: M{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toFixed(2)}</strong></p>
                      {item.fruit_id && <small>Available quantity: {available} boxes</small>}
                    </div>
                  );
                })}

                <button type="button" className="view-button" onClick={addSaleItem}>+ Add Another Item</button>

                <div style={{ marginTop: '20px', padding: '18px', background: '#f5f7f8', borderRadius: '8px' }}>
                  <h2>Total Sale Amount: M{saleTotal.toFixed(2)}</h2>
                  <p>Total items: {saleItems.length}</p>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="save-button" disabled={saleSaving || vendors.length === 0 || fruits.length === 0 || stock.length === 0}>
                    {saleSaving ? 'Recording Sale...' : 'Record Sale'}
                  </button>
                  <button type="button" className="cancel-button" onClick={resetSaleForm} disabled={saleSaving}>Clear Form</button>
                </div>
              </form>
            </div>

            <div className="supplier-list-card">
              <div className="section-heading">
                <div><h2>Sales History</h2><p>Total sales recorded: {sales.length}</p></div>
                <button className="view-button" onClick={fetchSales} disabled={saleLoading}>Refresh Sales</button>
              </div>

              {saleLoading ? <p>Loading sales...</p> : sales.length === 0 ? <p>No sales recorded yet.</p> : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Sale ID</th><th>Vendor</th><th>Sale Date</th><th>Total Amount</th><th>Payment Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {sales.map(sale => (
                        <tr key={sale.sale_id}>
                          <td>{sale.sale_id}</td>
                          <td><strong>{sale.vendor_name}</strong></td>
                          <td>{String(sale.sale_date).slice(0, 10)}</td>
                          <td>M{Number(sale.total_amount).toFixed(2)}</td>
                          <td>
                            <span className={`status-badge ${sale.payment_status === 'PAID' ? 'paid' : sale.payment_status === 'PARTIALLY_PAID' ? 'partial' : 'unpaid'}`}>
                              {sale.payment_status === 'PARTIALLY_PAID' ? 'Partially Paid' : sale.payment_status}
                            </span>
                          </td>
                          <td><button className="edit-button" onClick={() => viewSaleDetails(sale.sale_id)}>View Details</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {selectedSale !== null && (
              <div className="supplier-list-card">
                <div className="section-heading">
                  <div><h2>Sale #{selectedSale} Details</h2><p>Fruits and quantities included in this sale.</p></div>
                  <button className="cancel-button" onClick={() => {
                    setSelectedSale(null);
                    setSaleDetails([]);
                  }}>Close Details</button>
                </div>

                {saleDetailsLoading ? <p>Loading sale details...</p> : saleDetails.length === 0 ? <p>No sale details found.</p> : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr><th>Fruit</th><th>Packaging Size</th><th>Quantity</th><th>Unit Price</th><th>Subtotal</th></tr>
                      </thead>
                      <tbody>
                        {saleDetails.map(detail => (
                          <tr key={detail.sales_detail_id}>
                            <td><strong>{detail.fruit_name}</strong></td>
                            <td>{detail.packaging_size}</td>
                            <td>{detail.quantity}</td>
                            <td>M{Number(detail.unit_price).toFixed(2)}</td>
                            <td>M{Number(detail.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div style={{ padding: '15px', background: '#f5f7f8', borderRadius: '8px', marginTop: '15px' }}>
                  <h3>Sale Total: M{saleDetails.reduce((total, detail) => total + Number(detail.subtotal), 0).toFixed(2)}</h3>
                </div>
              </div>
            )}
          </section>
        )}

        {/* PAYMENTS MANAGEMENT */}
        {activePage === 'Payments' && (
          <section className="supplier-page">
            <div className="section-heading">
              <div><h2>Payments Management</h2><p>Record payments received from vendors and monitor outstanding balances.</p></div>
              <button className="view-button" onClick={() => {
                fetchPayments();
                fetchPaymentSales();
              }} disabled={paymentLoading}>Refresh Payments</button>
            </div>

            {paymentMessage && <div className="supplier-message">{paymentMessage}</div>}

            <div className="supplier-form-card">
              <h3>Record New Payment</h3>

              <form onSubmit={handlePaymentSubmit} className="supplier-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Sale</label>
                    <select name="sale_id" value={paymentForm.sale_id} onChange={handlePaymentFormChange} required>
                      <option value="">Choose sale</option>
                      {paymentSales.map(sale => (
                        <option key={sale.sale_id} value={sale.sale_id}>
                          Sale #{sale.sale_id} - {sale.vendor_name} - Outstanding: M{Number(sale.outstanding_balance).toFixed(2)}
                        </option>
                      ))}
                    </select>
                    {paymentSales.length === 0 && <small>There are currently no sales with outstanding balances.</small>}
                  </div>

                  <div className="form-group">
                    <label>Payment Date</label>
                    <input type="date" name="payment_date" value={paymentForm.payment_date} onChange={handlePaymentFormChange} required />
                  </div>

                  <div className="form-group">
                    <label>Payment Method</label>
                    <select name="payment_method" value={paymentForm.payment_method} onChange={handlePaymentFormChange} required>
                      <option value="CASH">Cash</option>
                      <option value="BANK TRANSFER">Bank Transfer</option>
                      <option value="MOBILE MONEY">Mobile Money</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Payment Amount (M)</label>
                    <input type="number" name="payment_amount" min="0.01" step="0.01" placeholder="Enter payment amount" value={paymentForm.payment_amount} onChange={handlePaymentFormChange} required />
                  </div>
                </div>

                {selectedPaymentSale && (
                  <div style={{ marginTop: '20px', padding: '18px', background: '#f5f7f8', borderRadius: '8px' }}>
                    <h3>Selected Sale Information</h3>
                    <p><strong>Sale ID:</strong> #{selectedPaymentSale.sale_id}</p>
                    <p><strong>Vendor:</strong> {selectedPaymentSale.vendor_name}</p>
                    <p><strong>Total Sale Amount:</strong> M{Number(selectedPaymentSale.total_amount).toFixed(2)}</p>
                    <p><strong>Amount Already Paid:</strong> M{Number(selectedPaymentSale.amount_paid || 0).toFixed(2)}</p>
                    <h3>Outstanding Balance: M{Number(selectedPaymentSale.outstanding_balance).toFixed(2)}</h3>
                  </div>
                )}

                <div className="form-buttons">
                  <button type="submit" className="save-button" disabled={paymentSaving || paymentSales.length === 0}>
                    {paymentSaving ? 'Recording Payment...' : 'Record Payment'}
                  </button>

                  <button type="button" className="cancel-button" onClick={() => {
                    setPaymentForm({
                      sale_id: '',
                      payment_amount: '',
                      payment_method: 'CASH',
                      payment_date: new Date().toISOString().slice(0, 10)
                    });
                    setPaymentMessage('');
                  }}>Clear Form</button>
                </div>
              </form>
            </div>

            <div className="supplier-list-card">
              <div className="section-heading">
                <div><h2>Outstanding Sales</h2><p>Sales that still have unpaid balances.</p></div>
              </div>

              {paymentLoading ? <p>Loading outstanding sales...</p> : paymentSales.length === 0 ? <p>No outstanding sales found.</p> : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Sale ID</th><th>Vendor</th><th>Total Amount</th><th>Amount Paid</th><th>Outstanding Balance</th></tr>
                    </thead>
                    <tbody>
                      {paymentSales.map(sale => (
                        <tr key={sale.sale_id}>
                          <td>#{sale.sale_id}</td>
                          <td><strong>{sale.vendor_name}</strong></td>
                          <td>M{Number(sale.total_amount).toFixed(2)}</td>
                          <td>M{Number(sale.amount_paid || 0).toFixed(2)}</td>
                          <td><strong>M{Number(sale.outstanding_balance).toFixed(2)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="supplier-list-card">
              <div className="section-heading">
                <div><h2>Payment History</h2><p>Total payments recorded: {payments.length}</p></div>
                <button className="view-button" onClick={fetchPayments} disabled={paymentLoading}>Refresh History</button>
              </div>

              {paymentLoading ? <p>Loading payment history...</p> : payments.length === 0 ? <p>No payments recorded yet.</p> : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>Sale ID</th>
                        <th>Vendor</th>
                        <th>Payment Date</th>
                        <th>Payment Method</th>
                        <th>Amount Paid</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.payment_id}>
                          <td>{payment.payment_id}</td>
                          <td>#{payment.sale_id}</td>
                          <td><strong>{payment.vendor_name}</strong></td>
                          <td>{String(payment.payment_date).slice(0, 10)}</td>
                          <td>{payment.payment_method}</td>
                          <td><strong>M{Number(payment.payment_amount).toFixed(2)}</strong></td>
                          <td>
                            <button
                              className="view-button"
                              onClick={() => openViewDetails('Payment Details', payment)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* REPORTS */}
        {activePage === 'Reports' && (
          <section className="supplier-page">

            <div className="section-heading">
              <div>
                <h2>Business Reports</h2>
                <p>View sales, purchases, payments and stock reports.</p>
              </div>

              <div className="form-buttons">
                <button
                  className="view-button"
                  onClick={fetchReportData}
                  disabled={reportLoading}
                >
                  {reportLoading ? 'Loading Reports...' : 'Refresh Reports'}
                </button>

                <button
                  className="save-button"
                  onClick={() => window.print()}
                >
                  Print Reports
                </button>
              </div>
            </div>

            {reportMessage && (
              <div className="supplier-message">{reportMessage}</div>
            )}

            {/* DATE FILTERS */}
            <div className="supplier-form-card">
              <h3>Filter Reports by Date</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={e => setReportStartDate(e.target.value)}
                    max={reportEndDate || undefined}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={e => setReportEndDate(e.target.value)}
                    min={reportStartDate || undefined}
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button className="cancel-button" onClick={clearReportDates}>
                  Clear Date Filters
                </button>
              </div>
            </div>

            {reportLoading ? (
              <div className="supplier-list-card">
                <p>Loading business reports...</p>
              </div>
            ) : (
              <>
                {/* REPORT SUMMARY CARDS */}
                <section className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon green">S</div>
                    <div>
                      <p>Total Sales</p>
                      <h2>M{totalSales.toFixed(2)}</h2>
                      <small>{filteredSales.length} sales records</small>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon orange">P</div>
                    <div>
                      <p>Total Purchases</p>
                      <h2>M{totalPurchases.toFixed(2)}</h2>
                      <small>{filteredPurchases.length} purchase records</small>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon blue">M</div>
                    <div>
                      <p>Total Payments Received</p>
                      <h2>M{totalPayments.toFixed(2)}</h2>
                      <small>{filteredPayments.length} payment records</small>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon purple">S</div>
                    <div>
                      <p>Available Stock</p>
                      <h2>{totalStock}</h2>
                      <small>Total boxes currently available</small>
                    </div>
                  </div>
                </section>

                {/* SALES REPORT */}
                <div className="supplier-list-card">
                  <div className="section-heading">
                    <div>
                      <h2>Sales Report</h2>
                      <p>Sales recorded within the selected date range.</p>
                    </div>
                  </div>

                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Sale ID</th>
                          <th>Vendor</th>
                          <th>Sale Date</th>
                          <th>Total Amount</th>
                          <th>Payment Status</th>
                          <th className="no-print">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredSales.map(sale => (
                          <tr key={sale.sale_id}>
                            <td>#{sale.sale_id}</td>
                            <td>{sale.vendor_name}</td>
                            <td>{String(sale.sale_date).slice(0, 10)}</td>
                            <td>M{Number(sale.total_amount || 0).toFixed(2)}</td>
                            <td>{sale.payment_status}</td>
                            <td className="no-print"><button className="view-button" onClick={() => openViewDetails('Sale Details', sale)}>View</button></td>
                          </tr>
                        ))}

                        {filteredSales.length === 0 && (
                          <tr><td colSpan="6">No sales found for this date range.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PURCHASE REPORT */}
                <div className="supplier-list-card">
                  <div className="section-heading">
                    <div>
                      <h2>Purchase Report</h2>
                      <p>Purchases made from suppliers.</p>
                    </div>
                  </div>

                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Purchase ID</th>
                          <th>Supplier</th>
                          <th>Purchase Date</th>
                          <th>Total Amount</th>
                          <th className="no-print">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredPurchases.map(purchase => (
                          <tr key={purchase.purchase_id}>
                            <td>#{purchase.purchase_id}</td>
                            <td>{purchase.business_name}</td>
                            <td>{String(purchase.purchase_date).slice(0, 10)}</td>
                            <td>M{Number(purchase.total_amount || 0).toFixed(2)}</td>
                            <td className="no-print"><button className="view-button" onClick={() => openViewDetails('Purchase Details', purchase)}>View</button></td>
                          </tr>
                        ))}

                        {filteredPurchases.length === 0 && (
                          <tr><td colSpan="5">No purchases found for this date range.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PAYMENT REPORT */}
                <div className="supplier-list-card">
                  <div className="section-heading">
                    <div>
                      <h2>Payment Report</h2>
                      <p>Payments received from vendors.</p>
                    </div>
                  </div>

                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Payment ID</th>
                          <th>Sale ID</th>
                          <th>Vendor</th>
                          <th>Payment Date</th>
                          <th>Payment Method</th>
                          <th>Amount Paid</th>
                          <th className="no-print">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredPayments.map(payment => (
                          <tr key={payment.payment_id}>
                            <td>#{payment.payment_id}</td>
                            <td>#{payment.sale_id}</td>
                            <td>{payment.vendor_name}</td>
                            <td>{String(payment.payment_date).slice(0, 10)}</td>
                            <td>{payment.payment_method}</td>
                            <td>M{Number(payment.payment_amount || 0).toFixed(2)}</td>
                            <td className="no-print"><button className="view-button" onClick={() => openViewDetails('Payment Details', payment)}>View</button></td>
                          </tr>
                        ))}

                        {filteredPayments.length === 0 && (
                          <tr><td colSpan="7">No payments found for this date range.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* STOCK REPORT */}
                <div className="supplier-list-card">
                  <div className="section-heading">
                    <div>
                      <h2>Current Stock Report</h2>
                      <p>Current available quantities for all fruits.</p>
                    </div>
                  </div>

                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Stock ID</th>
                          <th>Fruit Name</th>
                          <th>Packaging Size</th>
                          <th>Available Quantity</th>
                          <th>Stock Status</th>
                          <th className="no-print">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {stock.map(item => (
                          <tr key={item.stock_id}>
                            <td>{item.stock_id}</td>
                            <td><strong>{item.fruit_name}</strong></td>
                            <td>{item.packaging_size}</td>
                            <td>{item.available_quantity}</td>
                            <td>
                              {Number(item.available_quantity) <= 10
                                ? 'Low Stock'
                                : 'In Stock'}
                            </td>
                            <td className="no-print"><button className="view-button" onClick={() => openViewDetails('Stock Details', item)}>View</button></td>
                          </tr>
                        ))}

                        {stock.length === 0 && (
                          <tr><td colSpan="6">No stock records available.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* LOW STOCK REPORT */}
                <div className="supplier-list-card">
                  <div className="section-heading">
                    <div>
                      <h2>Low Stock Report</h2>
                      <p>Fruit stock records with 10 boxes or fewer.</p>
                    </div>
                  </div>

                  {lowStock.length === 0 ? (
                    <p>No low-stock records found.</p>
                  ) : (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Fruit Name</th>
                            <th>Packaging Size</th>
                            <th>Available Quantity</th>
                            <th>Status</th>
                            <th className="no-print">Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {lowStock.map(item => (
                            <tr key={item.stock_id}>
                              <td><strong>{item.fruit_name}</strong></td>
                              <td>{item.packaging_size}</td>
                              <td>{item.available_quantity}</td>
                              <td>Low Stock</td>
                              <td className="no-print"><button className="view-button" onClick={() => openViewDetails('Low Stock Details', item)}>View</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* REPORT TOTALS */}
                <div className="supplier-list-card">
                  <h2>Report Summary</h2>
                  <p><strong>Total sales value:</strong> M{totalSales.toFixed(2)}</p>
                  <p><strong>Total purchase value:</strong> M{totalPurchases.toFixed(2)}</p>
                  <p><strong>Total payments received:</strong> M{totalPayments.toFixed(2)}</p>
                  <p><strong>Total available boxes:</strong> {totalStock}</p>
                  <p><strong>Low-stock records:</strong> {lowStock.length}</p>
                </div>
              </>
            )}
          </section>
        )}

        {/* GENERAL VIEW DETAILS MODAL */}
        {viewingRecord && (
          <div
            onClick={() => setViewingRecord(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="record-details-title"
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff',
                width: '100%',
                maxWidth: '550px',
                maxHeight: '85vh',
                overflowY: 'auto',
                borderRadius: '12px',
                padding: '25px',
                boxShadow: '0 10px 35px rgba(0,0,0,0.25)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '20px',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '15px'
                }}
              >
                <h2 id="record-details-title" style={{ margin: 0 }}>
                  {viewingRecord.title}
                </h2>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setViewingRecord(null)}
                >
                  Close
                </button>
              </div>

              <div>
                {Object.entries(viewingRecord.record).map(([field, value]) => (
                  <div
                    key={field}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(120px, 1fr) 2fr',
                      gap: '15px',
                      padding: '12px 5px',
                      borderBottom: '1px solid #eee',
                      overflowWrap: 'anywhere'
                    }}
                  >
                    <strong>{formatFieldName(field)}</strong>
                    <span>{formatFieldValue(value)}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                  type="button"
                  className="save-button"
                  onClick={() => setViewingRecord(null)}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;