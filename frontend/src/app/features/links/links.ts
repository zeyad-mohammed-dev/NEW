import { Component, OnInit, OnDestroy, inject, computed, signal, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { LinkService, LinkCategory } from '../../services/link.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { DropdownOption } from '../../shared/components/custom-dropdown/custom-dropdown';
import { Link } from '../../models/new.model';

export const LINK_TYPES = ['youtube', 'linkedin', 'facebook', 'instagram', 'tiktok', 'documentation', 'else'] as const;

export const TYPE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  youtube:      { bg: 'rgba(255, 0, 0, 0.15)',       color: '#FF4444', border: 'rgba(255, 0, 0, 0.3)' },
  linkedin:     { bg: 'rgba(10, 102, 194, 0.15)',    color: '#0A66C2', border: 'rgba(10, 102, 194, 0.3)' },
  facebook:     { bg: 'rgba(24, 119, 242, 0.15)',    color: '#1877F2', border: 'rgba(24, 119, 242, 0.3)' },
  instagram:    { bg: 'rgba(225, 48, 108, 0.15)',    color: '#E1306C', border: 'rgba(225, 48, 108, 0.3)' },
  tiktok:       { bg: 'rgba(255, 0, 80, 0.15)',      color: '#FF0050', border: 'rgba(255, 0, 80, 0.3)' },
  documentation:{ bg: 'rgba(16, 185, 129, 0.15)',    color: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
  else:         { bg: 'rgba(139, 92, 246, 0.15)',    color: '#A78BFA', border: 'rgba(139, 92, 246, 0.3)' },
};

export const TYPE_LABELS: Record<string, string> = {
  youtube: 'YouTube', linkedin: 'LinkedIn', facebook: 'Facebook',
  instagram: 'Instagram', tiktok: 'TikTok', documentation: 'Documentation', else: 'Other',
};

export const TYPE_ICONS: Record<string, string> = {
  youtube: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z',
  linkedin: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  instagram: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z',
  tiktok: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.34 6.34 0 0 0 9.32 22a6.33 6.33 0 0 0 6.34-6.22V8.89a8.26 8.26 0 0 0 4.84 1.55V6.97a4.83 4.83 0 0 1-.91-.28z',
  documentation: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20',
  else: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
};

export const CATEGORY_COLORS = [
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
] as const;

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EmptyStateComponent, ConfirmDialogComponent, LoadingComponent],
  templateUrl: './links.html',
  styleUrl: './links.scss'
})
export class Links implements OnInit, OnDestroy {
  @ViewChild('filterWrap') filterWrap!: ElementRef;

  constructor() {
    document.addEventListener('click', this.onDocClick);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocClick);
  }

  private onDocClick = (e: Event) => {
    if (this.showFilterMenu && this.filterWrap?.nativeElement && !this.filterWrap.nativeElement.contains(e.target as Node)) {
      this.showFilterMenu = false;
    }
  };

  private linkService = inject(LinkService);
  private toast = inject(ToastService);

  readonly LINK_TYPES = LINK_TYPES;
  readonly TYPE_COLORS = TYPE_COLORS;
  readonly TYPE_LABELS = TYPE_LABELS;
  readonly TYPE_ICONS = TYPE_ICONS;
  readonly CATEGORY_COLORS = CATEGORY_COLORS;

  loading = true;
  error = '';
  links = signal<Link[]>([]);
  searchQuery = signal('');
  filterCategory = signal('');
  filterType = signal('');

  showForm = false;
  editing = false;
  showCategoryForm = false;
  showFilterMenu = false;
  showCategoryPicker = false;
  newCategoryName = '';
  newCategoryColor = '#8B5CF6';
  editingCategory: LinkCategory | null = null;
  showDeleteCategoryConfirm = false;
  deletingCategory: LinkCategory | null = null;

  // Backend-persisted categories
  backendCategories = signal<LinkCategory[]>([]);

  form = new FormGroup({
    title: new FormControl(''),
    url: new FormControl(''),
    description: new FormControl(''),
    category: new FormControl(''),
    categoryColor: new FormControl('#8B5CF6'),
    type: new FormControl('else')
  });

  showDeleteConfirm = false;
  deleteMessage = '';

  // Build a map of category -> color from backend categories + links
  categoryColorMap = computed(() => {
    const map: Record<string, string> = {};
    // Backend categories first
    for (const c of this.backendCategories()) {
      map[c.name] = c.color;
    }
    // Override with colors from existing links (in case they differ)
    for (const l of this.links()) {
      if (l.category && l.categoryColor) {
        map[l.category] = l.categoryColor;
      }
    }
    return map;
  });

  categories = computed(() => {
    const cats = new Set<string>();
    // Backend categories
    for (const c of this.backendCategories()) {
      cats.add(c.name);
    }
    // Also include categories from existing links
    for (const l of this.links()) {
      if (l.category) cats.add(l.category);
    }
    return Array.from(cats).sort();
  });

  filteredLinks = computed(() => {
    let list = this.links();
    const cat = this.filterCategory();
    const type = this.filterType();
    const q = this.searchQuery();
    if (cat) {
      list = list.filter(l => l.category === cat);
    }
    if (type) {
      list = list.filter(l => (l.type || 'else') === type);
    }
    if (q) {
      const ql = q.toLowerCase();
      list = list.filter(l =>
        l.title.toLowerCase().includes(ql) ||
        (l.description || '').toLowerCase().includes(ql) ||
        l.url.toLowerCase().includes(ql) ||
        (l.category || '').toLowerCase().includes(ql)
      );
    }
    return list;
  });

  hasActiveFilter = computed(() => !!this.filterCategory() || !!this.filterType());

  categoryOptions = computed((): DropdownOption[] => {
    const opts: DropdownOption[] = [{ label: 'No Category', value: '' }];
    for (const cat of this.categories()) {
      opts.push({ label: cat, value: cat });
    }
    return opts;
  });

  ngOnInit() { this.load(); this.loadCategories(); }

  load() {
    this.loading = true;
    this.linkService.getAll().subscribe({
      next: (r) => { this.links.set(r); this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }

  loadCategories() {
    this.linkService.getCategories().subscribe({
      next: (cats) => { this.backendCategories.set(cats); },
      error: () => {}
    });
  }

  // === Filter ===
  toggleFilterMenu() { this.showFilterMenu = !this.showFilterMenu; }
  setFilterType(t: string) { this.filterType.set(this.filterType() === t ? '' : t); this.showFilterMenu = false; }
  setFilterCategory(cat: string) { this.filterCategory.set(this.filterCategory() === cat ? '' : cat); this.showFilterMenu = false; }
  clearFilters() { this.filterType.set(''); this.filterCategory.set(''); this.searchQuery.set(''); this.showFilterMenu = false; }

  onSearchInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  // === Category ===
  openCategoryForm() {
    this.editingCategory = null;
    this.newCategoryName = '';
    this.newCategoryColor = '#8B5CF6';
    this.showCategoryForm = true;
  }

  saveCategory() {
    const name = this.newCategoryName?.trim();
    if (!name) { this.toast.show('Category name is required', 'error'); return; }
    if (this.editingCategory) {
      // Update existing category
      this.linkService.updateCategory(this.editingCategory._id, { name, color: this.newCategoryColor }).subscribe({
        next: () => {
          this.loadCategories();
          this.load(); // Reload links to reflect name/color changes
          this.showCategoryForm = false;
          this.editingCategory = null;
          this.toast.show(`Category "${name}" updated`, 'success');
        },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update category', 'error'); }
      });
    } else {
      // Check duplicate for create only
      if (this.categories().some(c => c.toLowerCase() === name.toLowerCase())) {
        this.toast.show('Category already exists', 'error'); return;
      }
      this.linkService.createCategory({ name, color: this.newCategoryColor }).subscribe({
        next: () => {
          this.loadCategories();
          this.form.patchValue({ category: name, categoryColor: this.newCategoryColor });
          this.showCategoryForm = false;
          this.toast.show(`Category "${name}" created`, 'success');
        },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to create category', 'error'); }
      });
    }
  }

  onCategorySelect(cat: string) {
    const color = this.getCatColor(cat);
    this.form.patchValue({ category: cat, categoryColor: color });
  }

  editCategory(cat: LinkCategory) {
    this.editingCategory = cat;
    this.newCategoryName = cat.name;
    this.newCategoryColor = cat.color;
    this.showCategoryForm = true;
  }

  get deleteCategoryMessage(): string {
    return `Delete category "${this.deletingCategory?.name || ''}"? Links with this category will become uncategorized.`;
  }
  confirmDeleteCategory(cat: LinkCategory) {
    this.deletingCategory = cat;
    this.showDeleteCategoryConfirm = true;
  }
  cancelDeleteCategory() { this.showDeleteCategoryConfirm = false; this.deletingCategory = null; }
  doDeleteCategory() {
    if (!this.deletingCategory) return;
    const cat = this.deletingCategory;
    this.linkService.deleteCategory(cat._id).subscribe({
      next: () => {
        this.cancelDeleteCategory();
        this.loadCategories();
        this.load(); // Reload links to clear category from them
        this.toast.show(`Category "${cat.name}" deleted`, 'success');
      },
      error: (e) => { this.cancelDeleteCategory(); this.toast.show(e.error?.message || e.message || 'Failed to delete category', 'error'); }
    });
  }

  cancelCategoryForm() { this.showCategoryForm = false; this.editingCategory = null; }

  pickCategory(cat: string) {
    this.form.patchValue({ category: cat, categoryColor: cat ? this.getCatColor(cat) : '#8B5CF6' });
    this.showCategoryPicker = false;
  }

  // === Helpers ===
  typeColor(type: string) { return TYPE_COLORS[type] || TYPE_COLORS['else']; }
  typeLabel(type: string) { return TYPE_LABELS[type] || 'Other'; }
  typeStyle(type: string) { const c = this.typeColor(type); return { background: c.bg, color: c.color, borderColor: c.border }; }
  typeIcon(type: string) { return TYPE_ICONS[type] || TYPE_ICONS['else']; }
  getCatColor(cat: string): string { return this.categoryColorMap()[cat] || '#8B5CF6'; }

  // === Link CRUD ===
  openCreate() {
    this.editing = false;
    this.form.reset({ type: 'else', categoryColor: '#8B5CF6' });
    this.showForm = true;
  }

  openEdit(l: Link) {
    this.editing = true;
    this.selected = l;
    this.form.patchValue({
      title: l.title, url: l.url, description: l.description,
      category: l.category, categoryColor: l.categoryColor || '#8B5CF6', type: l.type || 'else'
    });
    this.showForm = true;
  }

  cancelForm() { this.showForm = false; }

  submit() {
    const val = this.form.value;
    if (!val.title?.trim()) { this.toast.show('Link title is required', 'error'); return; }
    if (!val.url?.trim()) { this.toast.show('URL is required', 'error'); return; }
    try { new URL(val.url); } catch { this.toast.show('Please enter a valid URL', 'error'); return; }

    const payload = {
      title: val.title || '', url: val.url || '', description: val.description || '',
      category: val.category || '', categoryColor: val.categoryColor || '#8B5CF6', type: val.type || 'else'
    };

    if (this.editing && this.selected) {
      this.linkService.update(this.selected._id, payload).subscribe({
        next: () => { this.cancelForm(); this.load(); this.toast.show('Link updated', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update link', 'error'); }
      });
    } else {
      this.linkService.create(payload).subscribe({
        next: () => { this.cancelForm(); this.load(); this.toast.show('Link saved', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to save link', 'error'); }
      });
    }
  }

  confirmDelete(l: Link) { this.selected = l; this.deleteMessage = `Delete "${l.title}"?`; this.showDeleteConfirm = true; }
  cancelDelete() { this.showDeleteConfirm = false; }
  doDelete() {
    if (!this.selected) return;
    this.linkService.delete(this.selected._id).subscribe({
      next: () => { this.cancelDelete(); this.load(); this.toast.show('Link deleted', 'success'); },
      error: (e) => { this.cancelDelete(); this.toast.show(e.error?.message || e.message || 'Failed to delete link', 'error'); }
    });
  }

  selected: Link | null = null;
  select(l: Link) { this.selected = this.selected?._id === l._id ? null : l; }

  // Detail modal (like Dua/Azkar)
  showDetailModal = false;
  detailLink: Link | null = null;
  openDetail(l: Link) { this.detailLink = l; this.showDetailModal = true; }
  closeDetail() { this.showDetailModal = false; this.detailLink = null; }

  formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  getDomain(url: string): string { try { return new URL(url).hostname.replace('www.', ''); } catch { return url; } }

  @HostListener('document:keydown.escape') onEscape() { this.closeFilterMenu(); this.cancelForm(); this.cancelCategoryForm(); }
  closeFilterMenu() { this.showFilterMenu = false; }
}
