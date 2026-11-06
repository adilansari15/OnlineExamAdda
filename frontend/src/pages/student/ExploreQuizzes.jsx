import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Clock, HelpCircle, ArrowRight, Award, AlertCircle, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { studentService } from '@/services/studentService';
import { categoryService } from '@/services/categoryService';

export default function ExploreQuizzes() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters from URL query params or state
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedDifficulty = searchParams.get('difficulty') || 'ALL';
  const selectedSort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Load categories
  useEffect(() => {
    categoryService.getActiveCategories()
      .then((res) => setCategories(res.data?.data || res.data || []))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new window.URLSearchParams(prev);
      if (value && value !== 'ALL' && value !== '') {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      if (key !== 'page') {
        next.set('page', '0');
      }
      return next;
    });
  };

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getQuizzes({
        q: searchQuery,
        categoryId: selectedCategory || undefined,
        difficulty: selectedDifficulty,
        sort: selectedSort,
        page,
        size: 9
      });
      const data = res?.data || res || {};
      setQuizzes(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch quizzes', err);
      setError(err?.response?.data?.message || 'Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedSort, page]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Explore Quizzes"
        subtitle="Browse available examinations, filter by curriculum topic, and test your subject mastery"
        actions={
          <div className="w-full sm:w-72">
            <SearchInput
              placeholder="Search by quiz title or topic..."
              value={searchQuery}
              onChange={(val) => updateParam('q', val)}
            />
          </div>
        }
      />

      {/* Categories chips bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => updateParam('category', '')}
          className={`px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
            !selectedCategory
              ? 'bg-primary text-primary-fg border-transparent font-semibold shadow-xs'
              : 'bg-surface-2 dark:bg-[#202020] text-silver border-border hover:border-border-strong hover:text-white'
          }`}
        >
          All Topics
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => updateParam('category', cat.id.toString())}
            className={`px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat.id.toString()
                ? 'bg-primary text-primary-fg border-transparent font-semibold shadow-xs'
                : 'bg-surface-2 dark:bg-[#202020] text-silver border-border hover:border-border-strong hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sub-filters & Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border">
        <div className="flex items-center gap-1.5">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => updateParam('difficulty', diff)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedDifficulty === diff
                  ? 'bg-surface-2 dark:bg-[#202020] text-text dark:text-white border border-border font-semibold shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              {diff === 'ALL' ? 'All Difficulties' : diff}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted">Sort by:</span>
          <div className="w-40">
            <Select
              value={selectedSort}
              onChange={(e) => updateParam('sort', e?.target?.value || e)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'title', label: 'Alphabetical' },
                { value: 'duration', label: 'Duration' },
                { value: 'difficulty', label: 'Difficulty' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchQuizzes}>
            Retry
          </Button>
        </div>
      )}

      {/* Quiz Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-surface-2 animate-pulse border border-border" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="py-16 text-center text-muted">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-text">No quizzes found</h3>
          <p className="text-xs text-muted max-w-sm mx-auto mt-1">
            {searchQuery || selectedCategory || selectedDifficulty !== 'ALL'
              ? 'No exams match your current filters. Try resetting search parameters.'
              : 'No published exams are currently available. Please check back later.'}
          </p>
          {(searchQuery || selectedCategory || selectedDifficulty !== 'ALL') && (
            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSearchParams(new window.URLSearchParams())}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col justify-between hover:border-border-strong hover:shadow-card transition-all">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-medium text-silver uppercase tracking-wider truncate">
                    {quiz.categoryName}
                  </span>
                  <Badge difficulty={quiz.difficulty} />
                </div>
                <CardTitle className="line-clamp-2 text-base font-display">{quiz.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs text-silver">
                  {quiz.description || 'Comprehensive assessment test for skill validation.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-2 border border-border text-center text-xs">
                  <div>
                    <span className="text-[10px] text-muted block">Duration</span>
                    <span className="font-semibold text-text flex items-center justify-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-silver" />
                      {quiz.durationMinutes}m
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block">Questions</span>
                    <span className="font-semibold text-text flex items-center justify-center gap-1 mt-0.5">
                      <HelpCircle className="w-3 h-3 text-silver" />
                      {quiz.questionCount ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block">Total Marks</span>
                    <span className="font-semibold text-text flex items-center justify-center gap-1 mt-0.5">
                      <Award className="w-3 h-3 text-silver" />
                      {quiz.totalMarks ?? 0}
                    </span>
                  </div>
                </div>

                {quiz.hasNegativeMarking && (
                  <div className="text-[11px] text-warning flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                    Negative marking applies (-{quiz.negativeMarks} per wrong answer)
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t border-border pt-4">
                <Link to={`/app/quizzes/${quiz.id}`} className="w-full">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-between"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View Exam Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 border-t border-border/60 text-xs text-muted">
          <span>Showing {quizzes.length} of {totalElements} published exams</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => updateParam('page', (page - 1).toString())}
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <span className="px-2 font-medium text-text">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => updateParam('page', (page + 1).toString())}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
