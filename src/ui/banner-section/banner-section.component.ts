import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
    ModalService,
    AssetPickerDialogComponent,
    Asset,
    SearchItem,
    DataService,
    NotificationService,
} from '@vendure/admin-ui/core';
import { BannerSectionFragment } from '../generated/ui';
import { Subject, Observable, of, concat } from 'rxjs';
import { CollectionList } from '../generated/ui';
import { debounceTime, distinctUntilChanged, switchMap, tap, takeUntil, map } from 'rxjs/operators';
import { gql } from '@apollo/client/core';

type CollectionItem = CollectionList['items'][number];

interface BannerSectionForm {
    assetId: string | null;
    productId: string | null;
    collectionId: string | null;
    externalLink: string | null;
    position: number;
}

@Component({
    selector: 'banner-section',
    templateUrl: './banner-section.component.html',
    styleUrls: ['./banner-section.component.scss'],
})
export class BannerSectionComponent implements OnInit, OnDestroy {
    @Input() section: FormGroup;
    @Input() bannerSection: BannerSectionFragment;
    @Input() isExpanded = true;

    selectedProduct: SearchItem;
    selectedAsset: Asset | null = null;

    // collections
    collectionsResult$: Observable<CollectionList['items']>;
    collectionsLoading = false;
    collectionsInput$ = new Subject<string>();

    // products
    productsResult$: Observable<SearchItem[]>;
    productsLoading = false;
    productsInput$ = new Subject<string>();

    private destroy$ = new Subject<void>();

    constructor(
        private dataService: DataService,
        private cdr: ChangeDetectorRef,
        private modalService: ModalService,
        private formBuilder: FormBuilder,
        private notificationService: NotificationService,
    ) {}

    ngOnInit() {
        this.initializeForm();
        this.setupSearchSubscriptions();
        this.loadInitialData();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm() {
        if (this.bannerSection) {
            if (this.bannerSection.asset) {
                this.selectedAsset = this.bannerSection.asset as Asset;
            }
        } else {
            this.isExpanded = true;
        }
        this.setPositionValidation();
    }

    private setupSearchSubscriptions() {
        this.setupCollectionSearch();
        this.setupProductSearch();
    }

    private loadInitialData() {
        // Subscribe to form value changes
        this.section.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: BannerSectionForm) => {
            // Update the component state based on form changes
            if (value.assetId && !this.selectedAsset) {
                // Use the assets query to get the asset
                interface GetAssetQuery {
                    asset: Asset | null;
                }

                this.dataService
                    .query<GetAssetQuery>(
                        gql`
                            query GetAsset($id: ID!) {
                                asset(id: $id) {
                                    id
                                    preview
                                    name
                                    width
                                    height
                                    source
                                }
                            }
                        `,
                        { id: value.assetId },
                    )
                    .single$.pipe(
                        takeUntil(this.destroy$),
                        map(result => result.asset),
                    )
                    .subscribe({
                        next: asset => {
                            if (asset) {
                                this.selectedAsset = asset;
                                this.cdr.markForCheck();
                            }
                        },
                        error: err => this.handleError('Error loading asset', err),
                    });
            }
        });
    }

    private setPositionValidation() {
        const positionControl = this.section.get('position');
        if (positionControl) {
            positionControl.setValidators([Validators.required, Validators.min(0)]);
            positionControl.updateValueAndValidity();
        }
    }

    private setupCollectionSearch() {
        const collectionId = this.section.get('collectionId')?.value;

        const initialCollection$ = collectionId
            ? this.dataService.collection.getCollectionContents(collectionId).mapSingle(result => {
                  if (result?.collection) {
                      return [result.collection] as CollectionItem[];
                  }
                  return [];
              })
            : of([]);

        this.collectionsResult$ = concat(
            initialCollection$,
            this.collectionsInput$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                tap(() => (this.collectionsLoading = true)),
                switchMap(term => this.searchCollections(term)),
                tap(() => (this.collectionsLoading = false)),
                takeUntil(this.destroy$),
            ),
        );
    }

    private searchCollections(term: string): Observable<CollectionItem[]> {
        if (!term) {
            return of([]);
        }
        return this.dataService.collection
            .getCollections({
                take: 10,
                filter: {
                    name: {
                        contains: term,
                    },
                },
            })
            .mapSingle(result => result.collections.items as CollectionList['items'])
            .pipe(
                tap({
                    error: err => this.handleError('Error searching collections', err),
                }),
            );
    }

    private setupProductSearch() {
        const productId = this.section.get('productId')?.value;

        const initialProduct$ = productId
            ? this.dataService.product.getProduct(productId).mapSingle(result => {
                  if (result.product) {
                      return [
                          {
                              productId: result.product.id,
                              productName: result.product.name,
                          },
                      ] as SearchItem[];
                  }
                  return [];
              })
            : of([]);

        this.productsResult$ = concat(
            initialProduct$,
            this.productsInput$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                tap(() => (this.productsLoading = true)),
                switchMap(term => this.searchProducts(term)),
                tap(() => (this.productsLoading = false)),
                takeUntil(this.destroy$),
            ),
        );
    }

    private searchProducts(term: string): Observable<SearchItem[]> {
        if (!term) {
            return of([]);
        }
        return this.dataService.product
            .searchProducts(term, 10, 0)
            .mapSingle(result => result.search.items as SearchItem[])
            .pipe(
                tap({
                    error: err => this.handleError('Error searching products', err),
                }),
            );
    }

    private handleError(message: string, error: any) {
        console.error(error);
        this.notificationService.error(message);
    }

    selectAssets() {
        this.modalService
            .fromComponent(AssetPickerDialogComponent, {
                size: 'xl',
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result: Asset[] | undefined) => {
                    if (Array.isArray(result) && result.length > 0) {
                        this.selectedAsset = result[0];
                        this.cdr.markForCheck();
                        const assetIdControl = this.section.get('assetId');
                        if (assetIdControl) {
                            assetIdControl.setValue(this.selectedAsset.id);
                            assetIdControl.markAsTouched();
                        }
                    }
                },
                error: err => this.handleError('Error selecting asset', err),
            });
    }

    collectionTrackByFn(item: CollectionItem) {
        return item.id;
    }

    productTrackByFn(item: SearchItem) {
        return item.productId;
    }

    get coverButtonText(): string {
        return this.selectedAsset ? 'banner-plugin.section.edit-cover' : 'banner-plugin.section.add-cover';
    }

    get hideSection() {
        return typeof this.bannerSection === 'undefined';
    }

    toggleSection() {
        this.isExpanded = !this.isExpanded;
    }
}
