using EL.Models.Group;
using FluentValidation;

namespace BLL.Validators
{
    public class GroupMessageValidator : AbstractValidator<GroupMessage>
    {
        public GroupMessageValidator()
        {
            RuleFor(x => x.GroupId)
                .GreaterThan(0).WithMessage("GroupId must be greater than 0.");

            RuleFor(x => x.SenderId)
                .NotEmpty().WithMessage("SenderId is required.");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Message content cannot be empty.")
                .MaximumLength(1000).WithMessage("Message content cannot exceed 1000 characters.");

            RuleFor(x => x.SendAt)
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("SendAt cannot be in the future.");
        }
    }
}
