import {
    BaseDetailComponent,
    DataService,
    NotificationService,
    ServerConfigService,
    createUpdatedTranslatable,
    ModalService,
    PermissionsService,
    findTranslation,
} from '@vendure/admin-ui/core';
import { omit } from '@vendure/common/lib/omit';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    BannerFragment,
    CreateBannerMutation,
    CreateBannerInput,
    BannerSectionFragment,
    UpdateBannerMutation,
    UpdateBannerMutationVariables,
    DeleteBannerSectionMutation,
    DeleteBannerSectionMutationVariables,
} from '../generated/ui';
import { mergeMap, take } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { LanguageCode } from '@vendure/core';
import { CREATE_BANNER, UPDATE_BANNER, DELETE_BANNER_SECTION } from './banner-detail.graphql';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

function exclusiveProductCollection(control: any): ValidationErrors | null {
    const productId = control.get('productId').value;
    const collectionId = control.get('collectionId').value;
    const externalLink = control.get('externalLink').value;

    const fieldsPresent = [productId, collectionId, externalLink].filter(field => !!field).length;

    if (fieldsPresent !== 1) {
        return { exclusiveProductCollection: true };
    }

    return null;
}

@Component({
    selector: 'banner',
    templateUrl: './banner-detail.component.html',
    styleUrls: ['./banner-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerDetailComponent extends BaseDetailComponent<BannerFragment> implements OnInit, OnDestroy {
    detailForm: FormGroup;

    banner$: Observable<BannerFragment>;
    bannerSections: BannerSectionFragment[] = [];
    expandSections = false;
    constructor(
        route: ActivatedRoute,
        router: Router,
        serverConfigService: ServerConfigService,
        permissionsService: PermissionsService,
        protected dataService: DataService,
        private formBuilder: FormBuilder,
        private modalService: ModalService,
        private changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService,
    ) {
        super(route, router, serverConfigService, dataService, permissionsService);
        this.detailForm = this.formBuilder.group({
            enabled: [true],
            name: ['', Validators.required],
            sections: this.formBuilder.array([]),
        });
    }

    ngOnInit(): void {
        this.init();
        this.banner$ = this.entity$;
        this.route.paramMap.subscribe(params => {
            this.expandSections = !params.has('id');
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    protected setFormValues(entity: BannerFragment, languageCode: LanguageCode): void {
        const translatedSections = this.getTranslatedSections(entity, languageCode).sort(
            (a, b) => a.position - b.position,
        );

        this.bannerSections = entity.sections ?? [];

        this.detailForm.patchValue({
            name: entity.name,
            enabled: entity.enabled,
        });

        this.sections.clear();
        translatedSections.forEach(section => {
            this.addSection(section);
        });

        if (translatedSections.length === 0) {
            this.addSection();
        }
    }

    private getTranslatedSections(entity: BannerFragment, languageCode: LanguageCode) {
        const sections = entity.sections ?? [];

        return sections.map(section => {
            const { asset, product, collection, position = 0 } = section;
            const translation = findTranslation(section, languageCode) ?? {
                title: '',
                description: '',
                callToAction: '',
                languageCode,
            };

            return {
                sectionId: section.id,
                ...translation,
                externalLink: section?.externalLink ?? null,
                assetId: asset?.id ?? null,
                productId: product?.id ?? null,
                collectionId: collection?.id ?? null,
                position,
            };
        });
    }

    addSection(input?: any) {
        const position = input?.position ?? this.sections.length;
        const sectionGroup = this.formBuilder.nonNullable.group(
            {
                title: [input?.title ?? '', Validators.required],
                description: [input?.description ?? ''],
                callToAction: [input?.callToAction ?? '', Validators.required],
                productId: [input?.productId ?? null],
                collectionId: [input?.collectionId ?? null],
                assetId: [input?.assetId ?? null, Validators.required],
                externalLink: [input?.externalLink ?? '', Validators.pattern(/^https:\/\/[^ "]+$/)],
                id: [input?.id ?? null],
                sectionId: [input?.sectionId ?? null],
                position: [position, [Validators.required, Validators.min(0)]],
            },
            { validators: exclusiveProductCollection },
        );

        this.sections.push(sectionGroup);
    }

    deleteSection(index: number) {
        this.sections.removeAt(index);
    }

    create() {
        if (!this.detailForm.dirty) {
            return;
        }

        combineLatest([this.languageCode$, this.banner$])
            .pipe(
                take(1),
                mergeMap(([languageCode]) => {
                    const formValue = this.detailForm.value;

                    const sections = formValue.sections.map((section: any) => {
                        const translatedSection = {
                            ...createUpdatedTranslatable({
                                translatable: section,
                                updatedFields: section,
                                languageCode,
                                defaultTranslation: {
                                    title: section.title,
                                    description: section.description,
                                    callToAction: section.callToAction,
                                    languageCode,
                                },
                            }),
                        };

                        return omit(translatedSection, ['title', 'description', 'callToAction', 'sectionId']);
                    });

                    return this.dataService.mutate<CreateBannerMutation, { input: CreateBannerInput }>(
                        CREATE_BANNER,
                        {
                            input: {
                                name: formValue.name,
                                enabled: formValue.enabled,
                                sections,
                            },
                        },
                    );
                }),
            )

            .subscribe({
                next: res => {
                    this.detailForm.markAsPristine();
                    this.changeDetector.markForCheck();
                    this.notificationService.success('common.notify-create-success', {
                        entity: 'Banner',
                    });

                    this.router.navigate(['../', res.createBanner.id], {
                        relativeTo: this.route,
                    });
                },
                error: () => {
                    this.notificationService.error('common.notify-create-error', {
                        entity: 'Banner',
                    });
                },
            });
    }

    update() {
        combineLatest([this.languageCode$, this.banner$])
            .pipe(
                take(1),
                mergeMap(([languageCode, banner]) => {
                    const formValue = this.detailForm.value;
                    const sections = formValue.sections.map((section: any) => {
                        const sectionEntity = this.bannerSections.find(
                            s => s.id === section.sectionId,
                        ) as BannerSectionFragment;

                        if (sectionEntity) {
                            section.translations = sectionEntity.translations;
                        }

                        const translatedSection = {
                            ...createUpdatedTranslatable({
                                translatable: section,
                                updatedFields: section,
                                languageCode,
                                defaultTranslation: {
                                    title: section.title,
                                    description: section.description,
                                    callToAction: section.callToAction,
                                    languageCode,
                                },
                            }),
                        };

                        return omit(translatedSection, ['title', 'description', 'callToAction', 'sectionId']);
                    });

                    return this.dataService.mutate<UpdateBannerMutation, UpdateBannerMutationVariables>(
                        UPDATE_BANNER,
                        {
                            input: {
                                id: banner.id,
                                name: formValue.name,
                                enabled: formValue.enabled,
                                sections,
                            },
                        },
                    );
                }),
            )
            .subscribe({
                next: () => {
                    this.detailForm.markAsPristine();
                    this.changeDetector.markForCheck();
                    this.notificationService.success('common.notify-update-success', {
                        entity: 'Banner',
                    });
                },
                error: error => {
                    console.log(error);
                    this.notificationService.error('common.notify-update-error', {
                        entity: 'Banner',
                    });
                },
            });
    }

    destroySection(section: BannerSectionFragment) {
        this.modalService
            .dialog({
                title: _('banner-plugin.section.delete-confirmation'),
                buttons: [
                    { type: 'secondary', label: _('common.cancel') },
                    { type: 'danger', label: _('common.confirm'), returnValue: true },
                ],
            })
            .subscribe((confirm: boolean | undefined) => {
                if (confirm) {
                    this.destroySectionMutation(section);
                }
            });
    }

    private destroySectionMutation(section: BannerSectionFragment) {
        this.dataService
            .mutate<
                DeleteBannerSectionMutation,
                DeleteBannerSectionMutationVariables
            >(DELETE_BANNER_SECTION, { input: { id: section.id } })
            .subscribe({
                next: () => {
                    this.notificationService.success('common.notify-delete-success');
                    this.detailForm.markAsPristine();
                    this.changeDetector.markForCheck();
                    this.router.navigate(['../', this], {
                        relativeTo: this.route,
                    });
                },
                error: () => {
                    this.notificationService.error('common.notify-delete-error');
                },
            });
    }

    get sections() {
        return this.detailForm.controls.sections as FormArray;
    }
}
