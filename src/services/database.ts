import { Product, ProductInstance, WarrantyRegistration } from '../types/warranty';

class Database {
  private products: Product[] = [];
  private productInstances: ProductInstance[] = [];
  private warranties: WarrantyRegistration[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const products = localStorage.getItem('warranty_products');
    const instances = localStorage.getItem('warranty_instances');
    const warranties = localStorage.getItem('warranty_registrations');

    if (products) this.products = JSON.parse(products);
    if (instances) this.productInstances = JSON.parse(instances);
    if (warranties) this.warranties = JSON.parse(warranties);
  }

  private saveToStorage() {
    localStorage.setItem('warranty_products', JSON.stringify(this.products));
    localStorage.setItem('warranty_instances', JSON.stringify(this.productInstances));
    localStorage.setItem('warranty_registrations', JSON.stringify(this.warranties));
  }

  // Products
  addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.products.push(newProduct);
    this.saveToStorage();
    return newProduct;
  }

  getProducts(): Product[] {
    return this.products;
  }

  getProduct(id: string): Product | null {
    return this.products.find(p => p.id === id) || null;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.products[index] = { ...this.products[index], ...updates };
    this.saveToStorage();
    return this.products[index];
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    // Also delete related instances and warranties
    this.productInstances = this.productInstances.filter(i => i.productId !== id);
    this.warranties = this.warranties.filter(w => {
      const instance = this.productInstances.find(i => i.id === w.productInstanceId);
      return instance?.productId !== id;
    });
    
    this.products.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Product Instances
  addProductInstance(instance: Omit<ProductInstance, 'id' | 'createdAt'>): ProductInstance {
    const newInstance: ProductInstance = {
      ...instance,
      id: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    this.productInstances.push(newInstance);
    this.saveToStorage();
    return newInstance;
  }

  getProductInstances(productId?: string): ProductInstance[] {
    if (productId) {
      return this.productInstances.filter(i => i.productId === productId);
    }
    return this.productInstances;
  }

  getProductInstanceByQR(qrCode: string): ProductInstance | null {
    return this.productInstances.find(i => i.qrCode === qrCode) || null;
  }

  getProductInstanceByBarcode(barcode: string): ProductInstance | null {
    return this.productInstances.find(i => i.barcode === barcode) || null;
  }

  updateProductInstance(id: string, updates: Partial<ProductInstance>): ProductInstance | null {
    const index = this.productInstances.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    this.productInstances[index] = { ...this.productInstances[index], ...updates };
    this.saveToStorage();
    return this.productInstances[index];
  }

  // Warranty Registrations
  addWarrantyRegistration(registration: Omit<WarrantyRegistration, 'id' | 'registeredAt'>): WarrantyRegistration {
    const newRegistration: WarrantyRegistration = {
      ...registration,
      id: `warranty_${Date.now()}`,
      registeredAt: new Date().toISOString()
    };
    this.warranties.push(newRegistration);
    this.saveToStorage();
    return newRegistration;
  }

  getWarrantyRegistrations(): WarrantyRegistration[] {
    return this.warranties;
  }

  getWarrantyByInstanceId(instanceId: string): WarrantyRegistration | null {
    return this.warranties.find(w => w.productInstanceId === instanceId) || null;
  }
}

export const db = new Database();