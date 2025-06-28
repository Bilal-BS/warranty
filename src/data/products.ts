import { Product } from '../types/warranty';

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'SmartPhone Pro Max',
    brand: 'TechCorp',
    model: 'PM-2024',
    category: 'Electronics',
    warrantyPeriodMonths: 24,
    qrCode: 'QR001SMARTPHONE2024',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'prod-002',
    name: 'Laptop Ultra',
    brand: 'CompuTech',
    model: 'LU-2024',
    category: 'Electronics',
    warrantyPeriodMonths: 36,
    qrCode: 'QR002LAPTOP2024',
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'prod-003',
    name: 'Wireless Headphones',
    brand: 'AudioMax',
    model: 'WH-2024',
    category: 'Audio',
    warrantyPeriodMonths: 12,
    qrCode: 'QR003HEADPHONES2024',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'prod-004',
    name: 'Smart Watch',
    brand: 'WearTech',
    model: 'SW-2024',
    category: 'Wearables',
    warrantyPeriodMonths: 18,
    qrCode: 'QR004SMARTWATCH2024',
    image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'prod-005',
    name: 'Gaming Console',
    brand: 'GameTech',
    model: 'GC-2024',
    category: 'Gaming',
    warrantyPeriodMonths: 12,
    qrCode: 'QR005GAMING2024',
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];