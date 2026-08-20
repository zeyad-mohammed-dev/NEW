import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RuleService } from '../../services/rule.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { Rule } from '../../models/new.model';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, EmptyStateComponent, ConfirmDialogComponent, LoadingComponent],
  templateUrl: './rules.html',
  styleUrl: './rules.scss'
})
export class Rules implements OnInit {
  private ruleService = inject(RuleService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  loading = true;
  error = '';
  rules: Rule[] = [];
  selected: Rule | null = null;
  searchQuery = '';

  showForm = false;
  editing = false;
  form = new FormGroup({ title: new FormControl(''), content: new FormControl('') });

  showDeleteConfirm = false;
  deleteMessage = '';

  showDetailModal = false;
detailEntry: Rule | null = null;

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
    this.ruleService.getAll(this.searchQuery).subscribe({
      next: (r) => { this.rules = r; this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }

  search(q: string) { this.searchSubject.next(q); }
  select(r: Rule) { this.selected = this.selected?._id === r._id ? null : r; }

  openDetail(r: Rule) { this.detailEntry = r; this.showDetailModal = true; }
closeDetail() { this.showDetailModal = false; this.detailEntry = null; }

  openCreate() { this.editing = false; this.form.reset(); this.showForm = true; }
  openEdit(r: Rule) { this.editing = true; this.selected = r; this.form.patchValue({ title: r.title, content: r.content }); this.showForm = true; }
  cancelForm() { this.showForm = false; }

  submit() {
    const val = this.form.value;
    if (!val.title?.trim()) { this.toast.show('Rule title is required', 'error'); return; }
    if (this.editing && this.selected) {
      this.ruleService.update(this.selected._id, { title: val.title || '', content: val.content || '' }).subscribe({
        next: () => { this.cancelForm(); this.load(); this.toast.show('Rule updated', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update rule', 'error'); }
      });
    } else {
      this.ruleService.create({ title: val.title || '', content: val.content || '' }).subscribe({
        next: () => { this.cancelForm(); this.load(); this.toast.show('Rule created', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to create rule', 'error'); }
      });
    }
  }

  confirmDelete(r: Rule) { this.selected = r; this.deleteMessage = `Delete "${r.title}"?`; this.showDeleteConfirm = true; }
  cancelDelete() { this.showDeleteConfirm = false; }
  doDelete() {
    if (!this.selected) return;
    this.ruleService.delete(this.selected._id).subscribe({
      next: () => { this.cancelDelete(); this.selected = null; this.load(); this.toast.show('Rule deleted', 'success'); },
      error: (e) => { this.cancelDelete(); this.toast.show(e.error?.message || e.message || 'Failed to delete rule', 'error'); }
    });
  }

  formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
}