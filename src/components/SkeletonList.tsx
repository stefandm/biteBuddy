import RecipeSkeleton from "./RecipeSkeleton"

const SkeletonList = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <RecipeSkeleton cards={8} />
    </div>
)
}

export default SkeletonList

    