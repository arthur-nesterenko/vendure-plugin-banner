import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    BaseListComponent,
    DataService,
    ModalService,
    NotificationService,
    ServerConfigService,
} from '@vendure/admin-ui/core';
import {
    BannerFragment,
    GetBannersQuery,
    GetBannersQueryVariables,
    BannerFilterParameter,
    Banner,
    DeleteBannerMutation,
    DeleteBannerInput,
    LogicalOperator,
} from './../generated-types';
import { GET_BANNERS, DELETE_BANNER } from './banner-list.graphql';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { LanguageCode } from '@vendure/core';
import { EMPTY, Observable, merge } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, takeUntil, switchMap, tap } from 'rxjs/operators';
import { SharedModule } from '@vendure/admin-ui/core';

export type BannerSearchForm = {
    name: string;
};

@Component({
    selector: 'banner',
    templateUrl: './banner-list.component.html',
    styleUrls: ['./banner-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [SharedModule],
})
export class BannerListComponent
    extends BaseListComponent<GetBannersQuery, BannerFragment, GetBannersQueryVariables>
    implements OnInit, OnDestroy
{
    searchForm = new FormGroup({
        name: new FormControl(''),
        id: new FormControl(''),
    });

    availableLanguages$: Observable<LanguageCode[]>;
    contentLanguage$: Observable<LanguageCode>;

    constructor(
        private dataService: DataService,
        router: Router,
        route: ActivatedRoute,
        private modalService: ModalService,
        private notificationService: NotificationService,
        private serverConfigService: ServerConfigService,
    ) {
        super(router as any, route);

        super.setQueryFn(
            (...args: any[]) => {
                return this.dataService.query(GET_BANNERS, args);
            },
            data => data.banners,
            (skip, take) => this.createQueryOptions(skip, take),
        );
    }

    ngOnInit() {
        super.ngOnInit();
        this.contentLanguage$ = this.dataService.client
            .uiState()
            .mapStream(({ uiState }) => uiState.contentLanguage)
            .pipe(tap(() => this.refresh()));

        merge(this.searchForm.valueChanges.pipe(debounceTime(250)), this.route.queryParamMap)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.refresh();
            });

        this.availableLanguages$ = this.serverConfigService.getAvailableLanguages();
    }

    ngOnDestroy() {
        this.destroy$.next(undefined);
        this.destroy$.complete();
    }
    setLanguage(code: LanguageCode) {
        this.setQueryParam('lang', code);

        this.dataService.client.setContentLanguage(code).subscribe();
    }

    private createQueryOptions(skip: number, take: number): GetBannersQueryVariables {
        const filter: BannerFilterParameter = {};
        const response: GetBannersQueryVariables = {
            options: {
                skip,
                take,
                filter,
                filterOperator: LogicalOperator.AND,
            },
        };

        return response;
    }

    deleteBanner(banner: Banner) {
        this.modalService
            .dialog({
                title: _('banner-plugin.delete-confirmation'),
                buttons: [
                    { type: 'secondary', label: _('common.cancel') },
                    { type: 'danger', label: _('common.delete'), returnValue: true },
                ],
            })
            .pipe(
                switchMap(response =>
                    response
                        ? this.dataService.mutate<DeleteBannerMutation, { input: DeleteBannerInput }>(
                              DELETE_BANNER,
                              {
                                  input: { id: banner.id },
                              },
                          )
                        : EMPTY,
                ),
            )
            .subscribe({
                next: response => {
                    if (response.deleteBanner) {
                        this.notificationService.success(_('common.notify-delete-success'), {
                            entity: 'Banner',
                        });
                        this.refresh();
                    } else {
                        this.notificationService.error('banner-plugin.delete-error');
                    }
                },
                error: () => {
                    this.notificationService.error(_('common.notify-delete-error'), {
                        entity: 'Banner',
                    });
                },
            });
    }
}
