import debounce from 'lodash.debounce';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import CreateOrganizationForm from '~/modules/organizations/create-organization-form';
import DeleteOrganizations from '~/modules/organizations/delete-organizations';
import { Button } from '~/modules/ui/button';
import { Input } from '~/modules/ui/input';
import { useUserStore } from '~/store/user';
import { Organization } from '~/types';
import ColumnsView, { ColumnOrColumnGroup } from '../../common/data-table/columns-view';
import CountAndLoading from '../../common/data-table/count-and-loading';
import { dialog } from '../../common/dialoger/state';
import { toast } from 'sonner';

interface Props {
  total?: number;
  query?: string;
  selectedOrganizations: Organization[];
  setQuery?: (value: string) => void;
  isFiltered?: boolean;
  isLoading?: boolean;
  onResetFilters?: () => void;
  callback: (organizations: Organization[], action: 'create' | 'update' | 'delete') => void;
  columns: ColumnOrColumnGroup<Organization>[];
  setColumns: Dispatch<SetStateAction<ColumnOrColumnGroup<Organization>[]>>;
}

function Toolbar({ total, isFiltered, query, setQuery, isLoading, callback, onResetFilters, columns, setColumns, selectedOrganizations }: Props) {
  const { t } = useTranslation();
  const user = useUserStore((state) => state.user);

  const onOpenDeleteDialog = () => {
    dialog(
      <DeleteOrganizations
        organizations={selectedOrganizations}
        callback={(organizations) => {
          callback(organizations, 'delete');
          toast.success(
            t('success.delete_organizations', {
              defaultValue: 'Organizations deleted',
            }),
          );
        }}
        dialog
      />,
      {
        drawerOnMobile: false,
        className: 'max-w-xl',
        title: t('label.delete', {
          defaultValue: 'Delete',
        }),
        description: t('description.delete_organizations', {
          defaultValue: 'Are you sure you want to delete the selected organizations?',
        }),
      },
    );
  };

  return (
    <div className="items-center justify-between sm:flex">
      <div className="flex items-center space-x-2">
        {selectedOrganizations.length > 0 ? (
          <Button variant="destructive" className="relative" onClick={onOpenDeleteDialog}>
            <div className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1">
              <span className="text-xs font-medium text-white">{selectedOrganizations.length}</span>
            </div>
            {t('action.remove', {
              defaultValue: 'Remove',
            })}
          </Button>
        ) : (
          !isFiltered &&
          user.role === 'ADMIN' && (
            <Button
              onClick={() => {
                dialog(<CreateOrganizationForm callback={(organization) => callback([organization], 'create')} dialog />, {
                  className: 'sm:max-w-xl',
                  title: t('label.create_organization', {
                    defaultValue: 'Create organization',
                  }),
                });
              }}
            >
              {t('action.create', {
                defaultValue: 'Create',
              })}
            </Button>
          )
        )}
        <CountAndLoading
          count={total}
          isLoading={isLoading}
          singular={t('label.singular_organization', {
            defaultValue: 'organization',
          })}
          plural={t('label.plural_organization', {
            defaultValue: 'organizations',
          })}
          isFiltered={isFiltered}
          onResetFilters={onResetFilters}
        />
      </div>
      <div className="mt-2 flex items-center space-x-2 sm:mt-0">
        <Input
          placeholder={t('placeholder.search', {
            defaultValue: 'Search ...',
          })}
          defaultValue={query ?? ''}
          onChange={debounce((event: ChangeEvent<HTMLInputElement>) => {
            setQuery?.(event.target.value);
          }, 200)}
          className="h-10 w-[150px] lg:w-[250px]"
        />
        <ColumnsView columns={columns} setColumns={setColumns} />
      </div>
    </div>
  );
}

export default Toolbar;