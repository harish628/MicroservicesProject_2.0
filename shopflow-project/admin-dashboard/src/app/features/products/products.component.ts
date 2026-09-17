// src/app/features/products/products.component.ts
//
// Admin product management — list, search, create, edit, delete, restock.
// This is the most feature-dense page in the admin panel.

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Products</h1>
        <div class="page-sub">{{ total }} products in catalog</div>
      </div>
      <button class="btn btn-primary" (click)="openCreateModal()">+ New Product</button>
    </div>

    <div class="panel">
      <div style="display:flex; gap:12px; margin-bottom: 18px;">
        <input
          type="text"
          placeholder="Search products..."
          [(ngModel)]="search"
          (ngModelChange)="onSearchChange()"
          style="flex:1; background:var(--bg); border:1px solid var(--line); border-radius:6px; padding:10px 12px; color:var(--text); outline:none;"
        />
      </div>

      @if (loading) {
        <p class="loading-text">Loading products...</p>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (product of products; track product.id) {
              <tr>
                <td>
                  @if (product.image_url) {
                    <img class="product-thumb" [src]="product.image_url" [alt]="product.name" />
                  } @else {
                    <span class="product-thumb-placeholder">No image</span>
                  }
                </td>
                <td><strong>{{ product.name }}</strong></td>
                <td class="cell-muted">{{ product.category?.name || '—' }}</td>
                <td class="cell-mono">₹{{ product.price | number }}</td>
                <td class="cell-mono">
                  <span [class]="'badge ' + (product.stock === 0 ? 'badge-danger' : product.stock <= 5 ? 'badge-amber' : 'badge-sage')">
                    {{ product.stock }} units
                  </span>
                </td>
                <td>
                  <span [class]="'badge ' + (product.is_active ? 'badge-sage' : 'badge-muted')">
                    {{ product.is_active ? 'Active' : 'Hidden' }}
                  </span>
                </td>
                <td style="text-align:right;">
                  <button class="btn btn-sm" (click)="openEditModal(product)">Edit</button>
                  <button class="btn btn-sm btn-danger" (click)="deleteProduct(product)" style="margin-left:6px;">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr class="empty-row"><td colspan="7">No products found.</td></tr>
            }
          </tbody>
        </table>
      }
    </div>

    <!-- Create / Edit Modal -->
    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingProduct ? 'Edit Product' : 'New Product' }}</h3>
            <button class="modal-close" (click)="closeModal()">×</button>
          </div>

          @if (formError) {
            <div class="error-banner">{{ formError }}</div>
          }

          <div class="field">
            <label>Name</label>
            <input [(ngModel)]="form.name" type="text" placeholder="Product name" />
          </div>

          <div class="field">
            <label>Description</label>
            <textarea [(ngModel)]="form.description" rows="3" placeholder="Product description"></textarea>
          </div>

          <div class="field">
            <label>Image URL</label>
            <input [(ngModel)]="form.image_url" type="url" placeholder="https://example.com/product-image.jpg" />
            @if (form.image_url) {
              <img class="product-preview" [src]="form.image_url" [alt]="form.name || 'Product preview'" />
            }
          </div>

          <div class="field-row">
            <div class="field">
              <label>Price (₹)</label>
              <input [(ngModel)]="form.price" type="number" placeholder="0" />
            </div>
            <div class="field">
              <label>Stock</label>
              <input [(ngModel)]="form.stock" type="number" placeholder="0" />
            </div>
          </div>

          <div class="field">
            <label>Category</label>
            <select [(ngModel)]="form.category_id">
              <option [ngValue]="null">No category</option>
              @for (cat of categories; track cat.id) {
                <option [ngValue]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <button class="btn btn-primary" style="width:100%; justify-content:center; margin-top:8px;" (click)="saveProduct()">
            {{ editingProduct ? 'Save Changes' : 'Create Product' }}
          </button>
        </div>
      </div>
    }
  `,
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  total = 0;
  loading = true;
  search = '';

  showModal = false;
  editingProduct: Product | null = null;
  formError = '';
  form: { name: string; description: string; image_url: string; price: number | null; stock: number | null; category_id: number | null } = {
    name: '', description: '', image_url: '', price: null, stock: null, category_id: null,
  };

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.productService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: () => {},
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll({ per_page: 50, search: this.search || undefined }).subscribe({
      next: (res) => {
        this.products = res.products;
        this.total = res.total;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  // Debounce search the Angular way — setTimeout + clearTimeout, same concept as React's useEffect debounce
  onSearchChange(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadProducts(), 400);
  }

  openCreateModal(): void {
    this.editingProduct = null;
    this.form = { name: '', description: '', image_url: '', price: null, stock: 0, category_id: null };
    this.formError = '';
    this.showModal = true;
  }

  openEditModal(product: Product): void {
    this.editingProduct = product;
    this.form = {
      name: product.name,
      description: product.description || '',
      image_url: product.image_url || '',
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || null,
    };
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveProduct(): void {
    if (!this.form.name || !this.form.price) {
      this.formError = 'Name and price are required.';
      return;
    }

    const payload = {
      name: this.form.name,
      description: this.form.description,
      image_url: this.form.image_url || undefined,
      price: Number(this.form.price),
      category_id: this.form.category_id || undefined,
    };

    if (this.editingProduct) {
      this.productService.update(this.editingProduct.id, payload).subscribe({
        next: () => { this.closeModal(); this.loadProducts(); },
        error: (err) => (this.formError = this.formatApiError(err, 'Failed to update product.')),
      });
    } else {
      this.productService.create({ ...payload, stock: Number(this.form.stock) || 0 }).subscribe({
        next: () => { this.closeModal(); this.loadProducts(); },
        error: (err) => (this.formError = this.formatApiError(err, 'Failed to create product.')),
      });
    }
  }

  private formatApiError(error: { error?: { detail?: string | { msg?: string }[] } }, fallback: string): string {
    const detail = error.error?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((item) => item.msg || 'Invalid value').join(', ');
    return fallback;
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.name}"? This will hide it from the store.`)) return;

    this.productService.delete(product.id).subscribe({
      next: () => this.loadProducts(),
      error: () => alert('Failed to delete product.'),
    });
  }
}
