import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
    ModalService,
    AssetPickerDialogComponent,
    Asset,
    SearchItem,
    DataService,
} from '@vendure/admin-ui/core';
import { BannerSectionFragment } from '../generated/ui';
import { Subject, Observable, of, concat } from 'rxjs';
import { CollectionList } from '../generated/ui';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

type CollectionItem = CollectionList['items'][number];

@Component({
    selector: 'banner-section',
    templateUrl: './banner-section.component.html',
    styleUrls: ['./banner-section.component.scss'],
})
export class BannerSectionComponent implements OnInit {
    @Input() section: FormGroup;
    @Input() bannerSection: BannerSectionFragment;

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

    constructor(
        private dataService: DataService,
        private cdr: ChangeDetectorRef,
        private modalService: ModalService,
    ) {}

    ngOnInit() {
        this.searchCollection();
        this.searchProducts();

        if (this.bannerSection) {
            if (this.bannerSection.asset) {
                this.selectedAsset = this.bannerSection.asset as Asset;
            }
        }
    }

    searchCollection() {
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
                switchMap(term => {
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
                        .mapSingle(result => result.collections.items as CollectionList['items']);
                }),
                tap(() => (this.collectionsLoading = false)),
            ),
        );
    }

    searchProducts() {
        const productId = this.section.get('productId')?.value;

        const initialProduct$ = productId
            ? this.dataService.product.getProduct(productId).mapSingle(result => {
                  if (result.product) {
                      return [
                          {
                              productId: result.product.id,
                              productName: result.product.name,
                          },
                      ] as unknown as SearchItem[];
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
                switchMap(term => {
                    if (!term) {
                        return of([]);
                    }
                    return this.dataService.product
                        .searchProducts(term, 10, 0)
                        .mapSingle(result => result.search.items as SearchItem[]);
                }),
                tap(() => (this.productsLoading = false)),
            ),
        );
    }

    selectAssets() {
        this.modalService
            .fromComponent(AssetPickerDialogComponent, {
                size: 'xl',
            })
            .subscribe((result: Asset[] | undefined) => {
                if (Array.isArray(result)) {
                    this.selectedAsset = result[0];
                    this.cdr.markForCheck();
                    this.section.get('assetId')?.setValue(this.selectedAsset.id);
                    this.section.controls.assetId.markAsTouched();
                }
            });
    }

    collectionTrackByFn(item: CollectionItem) {
        return item.id;
    }

    productTrackByFn(item: SearchItem) {
        return item.productId;
    }
}
