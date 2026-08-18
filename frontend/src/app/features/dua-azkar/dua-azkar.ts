import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DuaService } from '../../services/dua.service';
import { ToastService } from '../../core/services/toast.service';
import { CustomDropdown, DropdownOption } from '../../shared/components/custom-dropdown/custom-dropdown';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { Dua } from '../../models/new.model';

@Component({
  selector: 'app-dua-azkar',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, EmptyStateComponent, ConfirmDialogComponent, LoadingComponent, CustomDropdown],
  templateUrl: './dua-azkar.html',
  styleUrl: './dua-azkar.scss'
})
export class DuaAzkar implements OnInit {
  private duaService = inject(DuaService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  loading = true;
  error = '';
  entries: Dua[] = [];
  searchQuery = '';
  typeFilter = '';
  selected: Dua | null = null;

  // Form
  showForm = false;
  editing = false;
  form = new FormGroup({ name: new FormControl(''), content: new FormControl(''), type: new FormControl('dua') });

  // Delete
  readonly typeOptions: DropdownOption[] = [
    { label: 'All Types', value: '' },
    { label: 'Dua', value: 'dua' },
    { label: 'Zikr', value: 'zikr' },
  ];
  readonly formTypeOptions: DropdownOption[] = [
    { label: 'Dua', value: 'dua' },
    { label: 'Zikr', value: 'zikr' },
  ];

  showDeleteConfirm = false;
  deleteMessage = '';

  showDetailModal = false;
  detailEntry: Dua | null = null;

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(q => { this.searchQuery = q; this.load(); });
    this.load();
  }

  load() {
    this.loading = true;
    this.duaService.getAll(this.searchQuery, this.typeFilter).subscribe({
      next: (d) => { this.entries = d; this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }

  search(q: string) { this.searchSubject.next(q); }
  filterType(t: string) { this.typeFilter = t; this.load(); }

  select(e: Dua) { this.selected = this.selected?._id === e._id ? null : e; }

  openDetail(e: Dua) { this.detailEntry = e; this.showDetailModal = true; }
  closeDetail() { this.showDetailModal = false; this.detailEntry = null; }

  openCreate() { this.editing = false; this.form.reset({ name: '', content: '', type: 'dua' }); this.showForm = true; }
  openEdit(e: Dua) { this.editing = true; this.selected = e; this.form.patchValue({ name: e.name, content: e.content, type: e.type }); this.showForm = true; }
  cancelForm() { this.showForm = false; }

  submit() {
    const val = this.form.value;
    if (!val.name?.trim()) return;
    if (this.editing && this.selected) {
      this.duaService.update(this.selected._id, { name: val.name || '', content: val.content || '', type: val.type || 'dua' }).subscribe({
        next: () => { this.cancelForm(); this.load(); this.toast.show('Dua updated', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update dua', 'error'); }
      });
    } else {
      this.duaService.create({ name: val.name || '', content: val.content || '', type: val.type || 'dua' }).subscribe({
        next: () => { this.cancelForm(); this.load(); this.toast.show('Dua created', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to create dua', 'error'); }
      });
    }
  }

  confirmDelete(e: Dua) { this.selected = e; this.deleteMessage = `Delete "${e.name}"?`; this.showDeleteConfirm = true; }
  cancelDelete() { this.showDeleteConfirm = false; }
  doDelete() {
    if (!this.selected) return;
    this.duaService.delete(this.selected._id).subscribe({
      next: () => { this.cancelDelete(); this.selected = null; this.load(); this.toast.show('Dua deleted', 'success'); },
      error: (e) => { this.cancelDelete(); this.toast.show(e.error?.message || e.message || 'Failed to delete dua', 'error'); }
    });
  }
}