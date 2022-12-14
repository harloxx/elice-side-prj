import CourseCard from '@components/CourseCard';
import FilterBar from '@components/FilterBar';
import SearchBar from '@components/SearchBar';
import { getAllCourseList } from '../../api/courselist';
import React, { useState, useEffect } from 'react';
import $ from './style.module.scss';
import { AiOutlineRight, AiOutlineLeft } from 'react-icons/ai';

import calcArrayView from '../../utils/calcArrayView';
import { useAppSelector } from '../../store';

export default function SearchSub() {
  const [courseCount, setCourseCount] = useState(0);

  const MAX_PAGE: number = 9;
  const DISPLAY_CARD: number = 20;
  const DISPLAY_INDEX: number =
    DISPLAY_CARD % MAX_PAGE === 0
      ? Math.floor(courseCount / DISPLAY_CARD)
      : Math.ceil(courseCount / DISPLAY_CARD);
  const SIDE_DISPLAY_INDEX = Math.floor(MAX_PAGE / 2);

  const [courseList, setCourseList] = useState([]);
  const [arrayView, setArrayView] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const [click, setClick] = useState(false);

  const { filter } = useAppSelector(state => state.filter);
  const { search } = useAppSelector(state => state.search);

  const calcInitArray = () => {
    {
      DISPLAY_INDEX >= 1
        ? DISPLAY_INDEX >= MAX_PAGE
          ? setArrayView(prev => {
              return calcArrayView(1, MAX_PAGE);
            })
          : setArrayView(prev => {
              return calcArrayView(1, DISPLAY_INDEX);
            })
        : '';
    }
  };

  useEffect(() => {
    getAllCourseList(filter, search, 0, DISPLAY_CARD)
      .then(data => {
        setCourseCount(data.course_count);
        setCourseList(data.courses);
      })
      .then(() => {
        //맨 처음 접속 시 current index 값 1
        calcInitArray();
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  // 검색
  useEffect(() => {
    getAllCourseList(filter, search, 0, DISPLAY_CARD)
      .then(data => {
        setCourseCount(data.course_count);
        setCourseList(data.courses);
      })
      .then(() => {
        setCurrent(prev => {
          return 1;
        });
        calcInitArray();
      })
      .catch(err => {
        console.log(err);
      });
  }, [click]);

  // 페이지 이동 시
  useEffect(() => {
    if (DISPLAY_INDEX < MAX_PAGE) {
      setArrayView(prev => {
        return calcArrayView(1, DISPLAY_INDEX);
      });
    } else if (current - SIDE_DISPLAY_INDEX >= 1) {
      if (current <= DISPLAY_INDEX - SIDE_DISPLAY_INDEX) {
        setArrayView(prev => {
          return calcArrayView(
            current - SIDE_DISPLAY_INDEX,
            current + SIDE_DISPLAY_INDEX,
          );
        });
      } else {
        // 마지막 페이지일때
        setArrayView(prev => {
          return calcArrayView(DISPLAY_INDEX - MAX_PAGE + 1, DISPLAY_INDEX);
        });
      }
    } else {
      //첫번째 페이지일때->1,2
      setArrayView(prev => {
        return calcArrayView(1, MAX_PAGE);
      });
    }
    setCurrent(prev => {
      return current;
    });
    getAllCourseList(filter, search, (current - 1) * DISPLAY_CARD, DISPLAY_CARD)
      .then(data => {
        setCourseCount(data.course_count);
        setCourseList(prev => {
          return data.courses;
        });
      })
      .catch(err => console.log(err));
  }, [current]);

  // cost 필터 적용 시 렌더링
  useEffect(() => {
    setCurrent(prev => {
      return 1;
    });
    getAllCourseList(filter, search, 0, DISPLAY_CARD)
      .then((data: any) => {
        setCourseCount(prev => {
          return data.course_count;
        });
        setCourseList(data.courses);
      })
      .then(() => {
        calcInitArray();
      })
      .catch(err => console.log(err));
  }, [filter]);

  const onClickLeft = () => {
    current === 1 ? '' : setCurrent(current - 1);
  };
  const onClickRight = () => {
    current === DISPLAY_INDEX ? '' : setCurrent(current + 1);
  };

  return (
    <div className={$.container}>
      <div className={$['desktop-container']}>
        <SearchBar
          click={click}
          setClick={(v: boolean) => {
            setClick(v);
          }}
        />
        <br />
        <FilterBar />
        <br />
        <span>전체 {courseCount}개</span>
        <hr />
        <div className={$['cards']}>
          {courseList?.map((course: any) => {
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
            // prob. 한 번 더 렌더링 되어야 숫자가 다시 나타남
            return (
              <div
                key={p}
                className={
                  current === p
                    ? $['index-num-active']
                    : $['index-num-deactive']
                }
                onClick={() => setCurrent(p)}
              >
                {p}
              </div>
            );
          })}

          <AiOutlineRight
            className={
              current === DISPLAY_INDEX
                ? $['arrow-deactive']
                : $['arrow-active']
            }
            onClick={onClickRight}
          />
        </div>
      </div>
    </div>
  );
}
