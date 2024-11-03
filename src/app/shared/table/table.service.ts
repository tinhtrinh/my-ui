import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFilter, ITableName, ITableRequest, ITableResponse } from './abstract-table';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor() { }

  getTableNames(moduleId: string): Observable<Array<ITableName>> {
    return new Observable((subscriber) => {
      subscriber.next([{id: '0', name: 'Table Zero'}, {id: '1', name: 'Table One'}])
    })
  }

  getData(request: ITableRequest): Observable<ITableResponse> {
    const { tableId, searchTerm, pageIndex, pageSize } = request;
    const length: number = tableId === '1' ? 50 : 100;
    const start: number = (pageIndex - 1) * pageSize;
    const end: number = (pageIndex - 1) * pageSize + pageSize;
    let users = Array.from({length: length}, (_, k) => createNewUser(k + 1));
    if(searchTerm) {
      users = users.filter((user) => {
        return user.id.includes(searchTerm)
        || user.name.includes(searchTerm)
        || user.fruit.includes(searchTerm)
        || user.progress.includes(searchTerm)
      })
    }
    const pageUsers = users.slice(start, end);
    return new Observable((subscriber) => {
      subscriber.next({
        displayedColumns: ['id', 'name', 'progress', 'fruit'],
        rowData: pageUsers,
        pageSize: pageSize,
        pageIndex: pageIndex,
        count: pageUsers.length,
        totalCount: users.length,
        hasNext: true,
        hasPrevious: true
      })
    })
  }

  getFruits(): Observable<Array<string>> {
    return new Observable((subcriber) => subcriber.next(FRUITS));
  }

  getFilters(tableId: string): Observable<Array<IFilter>> {
    let filters = [{
      column: 'Name',
      operator: 'equals',
      value: 'test'
    }]

    if(tableId == '1') {
      filters = [{
        column: 'ID',
        operator: 'Not equals',
        value: 'test'
      }]
    }
    
    return new Observable(subscriber => {
      subscriber.next(filters);
    })
  }
}

/** Builds and returns a new User. */
function createNewUser(id: number): UserData {
  const name =
    NAMES[Math.round(Math.random() * (NAMES.length - 1))] +
    ' ' +
    NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) +
    '.';

  return {
    id: id.toString(),
    name: name,
    progress: Math.round(Math.random() * 100).toString(),
    fruit: FRUITS[Math.round(Math.random() * (FRUITS.length - 1))],
  };
}

export interface UserData {
  id: string;
  name: string;
  progress: string;
  fruit: string;
}

/** Constants used to fill up our data base. */
const FRUITS: string[] = [
  'blueberry',
  'lychee',
  'kiwi',
  'mango',
  'peach',
  'lime',
  'pomegranate',
  'pineapple',
];
const NAMES: string[] = [
  'Maia',
  'Asher',
  'Olivia',
  'Atticus',
  'Amelia',
  'Jack',
  'Charlotte',
  'Theodore',
  'Isla',
  'Oliver',
  'Isabella',
  'Jasper',
  'Cora',
  'Levi',
  'Violet',
  'Arthur',
  'Mia',
  'Thomas',
  'Elizabeth',
];