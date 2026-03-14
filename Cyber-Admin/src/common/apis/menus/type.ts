export enum MenuTypeEnum {
  /** 目录 */
  CATALOG = 1,
  /** 菜单 */
  MENU = 2,
  /** 按钮/权限 */
  BUTTON = 3
}

export interface MenuData {
  id: number
  /** 0 表示顶级 */
  parentId: number
  name: string
  type: MenuTypeEnum
  path: string
  component: string
  permission: string
  icon: string
  sort: number
  status: boolean
  visible: boolean
  createTime: string
  children?: MenuData[]
}

export interface CreateOrUpdateMenuRequestData {
  id?: number
  parentId: number
  name: string
  type: MenuTypeEnum
  path: string
  component: string
  permission: string
  icon: string
  sort: number
  status: boolean
  visible: boolean
}

export interface MenuRequestData {
  name?: string
  status?: boolean | ""
}

export type MenuResponseData = ApiResponseData<MenuData[]>
