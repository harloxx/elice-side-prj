import CourseCard from '@components/CourseCard';
import FilterBar from '@components/FilterBar';
import SearchBar from '@components/SearchBar';
import { getAllCourseList } from '../../api/courselist';
import React, { useState } from 'react';
import { useEffect } from 'react';
import $ from './style.module.scss';
import { useAppDispatch, useAppSelector } from '../../store';
import { AiOutlineRight, AiOutlineLeft } from 'react-icons/ai';
import {
  setInitialArray,
  setCurrent,
  setCount,
  setArrayView,
} from '../../store/features/courseSlice';
import calcArray from '../../utils/calcArray';
import calcArrayView from '../../utils/calcArrayView';
export default function SearchSub() {
  const [courseList, setCourseList] = useState([]);
  const [courseCount, setCourseCount] = useState(0);
  const [array, setArray] = useState<number[]>([]);
  const [arrayView, setArrayView] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    getAllCourseList()
      .then((data: any) => {
        console.log(data);
        setCourseCount(data.course_count);
        setCourseList(data.courses);
      })
      .then(() => {
        console.log('couseCount : ' + courseCount);
        setArray(calcArray(courseCount));
        //맨 처음 접속 시 current index 값 1
        if (courseCount) {
          //현재 값은 redux-persist로 저장해야함
          setCurrent(1);
          {
            courseCount >= 1
              ? courseCount >= 5
                ? setArrayView(calcArrayView(1, 5))
                : setArrayView(calcArrayView(1, courseCount))
              : '';
          }
        } else {
          setCurrent(current);
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }, []);

  const onClickLeft = () => {
    current === 1 ? '' : setCurrent(current - 1);
  };
  const onClickRight = () => {
    current === courseCount ? '' : setCurrent(current + 1);
  };
  useEffect(() => {
    if (courseCount < 5) {
      setArrayView(calcArrayView(1, courseCount));
    } else if (current - 2 >= 1) {
      if (current <= courseCount - 2) {
        setArrayView(calcArrayView(current - 2, current + 2));
      } else {
        // 마지막 페이지일때
        setArrayView(calcArrayView(current - 5, current + 2));
      }
    } else {
      //첫번째 페이지일때->1,2
      setArrayView(calcArrayView(1, 5));
    }
    setCurrent(current);
  }, [current]);

  console.log(current, '현재, ', arrayView, ' 배열');

  return (
    <div className={$.container}>
      <SearchBar />
      <br />
      <FilterBar />
      <br />
      <br />
      <div className={$['cards']}>
        {courseList.map((course: any) => {
          return (
            <CourseCard
              key={course.id}
              title={course.title}
              subtitle={course.short_description}
              image={course.logo_file_url}
              is_free={course.is_free}
              enroll_type={course.enroll_type}
            />
          );
        })}
      </div>
      <div className={$['index']}>
        <AiOutlineLeft
          className={current === 1 ? $['arrow-deactive'] : $['arrow-active']}
          onClick={onClickLeft}
        />
        {arrayView.map(p => {
          return (
            <div
              key={p}
              className={
                current === p ? $['index-num-active'] : $['index-num-deactive']
              }
              onClick={() => setCurrent(p)}
            >
              {p}
            </div>
          );
        })}

        <AiOutlineRight
          className={
            current === courseCount ? $['arrow-deactive'] : $['arrow-active']
          }
          onClick={onClickRight}
        />
      </div>
    </div>
  );
}
